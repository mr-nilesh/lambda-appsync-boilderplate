// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
const fsPromise = fs.promises;
let mtDirName = 'mapping-templates'; // mapping template directory name
let lambdaFunctionsDir = 'src/functions'; // lambda functions src directory
const EFS_ACCESS = '${self:provider.environment.EFS_ACCESS}';
const VPC_SECURITY_GROUP = '${self:provider.environment.VPC_SECURITY_GROUP}';
const VPC_SUBNET1 = '${self:provider.environment.VPC_SUBNET1}';
const VPC_SUBNET2 = '${self:provider.environment.VPC_SUBNET2}';
const layer =
  'arn:aws:lambda:ap-southeast-1:468491936494:layer:fpam-api-layer:1';
const fileSystemConfig = `    fileSystemConfig:
      localMountPath: /mnt/downloads
      arn: ${EFS_ACCESS}
`;
const vpcConfig = `    vpc:
      securityGroupIds:
        - ${VPC_SECURITY_GROUP}
      subnetIds:
        - ${VPC_SUBNET1}
        - ${VPC_SUBNET2}
`;

const addFileSystemSupportToLambdas = [];
let applyVpcToLambdas = [];

/**
 * Read all the functions from the src directory and generate
 * aws appsync related files.
 * For exa: mapping templates
 */
const readFiles = async (dirname) => {
  // eslint-disable-next-line prettier/prettier
  const filenames = await fsPromise.readdir(dirname);
  filenames.forEach(async (file) => {
    const path = `${dirname}/${file}`;
    // eslint-disable-next-line prettier/prettier
    const states = await fsPromise.lstat(path);
    if (states.isDirectory()) {
      // create .yml file if not exist
      createYmlFile(path, file);
      let ymlFileLambdaContent = 'functions:\n';
      let ymlFileMTContent = 'mappingTemplates:\n';
      let ymlDatasourceContent = 'dataSources:\n';
      let ymlFileSchemaContent = `schema: ${path}/${file}.graphql\n`;
      const lambdaFunctions = await fsPromise.readdir(path);
      lambdaFunctions.forEach(async (fn) => {
        if (fn.includes('.ts') && !fn.includes('Rest.ts')) {
          let isMutation = false;
          if (fn.includes('Mutation.ts')) {
            isMutation = true;
          }
          const splitFnName = fn.split('.');
          const fnName = convertDashToCamleCase(splitFnName[0]);
          createMappingTemplateFile(fnName);
          const res = prepareYmlFile(
            fnName,
            `${path}/${splitFnName[0]}.handler`,
            ymlFileLambdaContent,
            ymlFileMTContent,
            ymlDatasourceContent,
            isMutation,
          );
          ymlFileLambdaContent = res.ymlFileLambdaContent;
          ymlFileMTContent = res.ymlFileMTContent;
          ymlDatasourceContent = res.ymlDatasourceContent;
        }
      });
      createYmlFile(
        path,
        file,
        true,
        ymlFileLambdaContent,
        ymlFileSchemaContent,
        ymlFileMTContent,
        ymlDatasourceContent,
      );
    }
  });
};

/**
 * Create mapping template directory if not exist
 */
const createMappingTemplatesDir = () => {
  if (!fs.existsSync(mtDirName)) {
    fs.mkdirSync(mtDirName);
  }
};

/**
 * Create mapping template files for every appsync query
 */
const createMappingTemplateFile = (fileName) => {
  fileName = removePostfixFromFile(fileName);
  const path = `${mtDirName}/${fileName}RequestMappingTemplate.txt`;
  if (!fs.existsSync(path)) {
    fs.appendFileSync(
      path,
      `{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "field": "${fileName}",
    "arguments":  $utils.toJson($context.arguments),
    "identity": {
      "userId": $utils.toJson($context.identity.sub)
    }
  }
}`,
    );
  }
};

const removePostfixFromFile = (fileName) => {
  if (fileName.includes('mutation')) {
    return fileName.replace('mutation', '');
  } else if (fileName.includes('query')) {
    return fileName.replace('query', '');
  } else if (fileName.includes('Mutation')) {
    return fileName.replace('Mutation', '');
  } else if (fileName.includes('Query')) {
    return fileName.replace('Query', '');
  }
};

/**
 * Create generic appsync response file
 */
const createGenericResponseMappingTemplate = () => {
  const path = `${mtDirName}/genericResponseMappingTemplate.txt`;
  if (!fs.existsSync(path)) {
    fs.appendFileSync(
      path,
      `#if ($context.result.errorMessage)
  $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
#else
  $utils.toJson($context.result)
#end`,
    );
  }
};

/**
 * Create .yml file if not exist
 */
const createYmlFile = (
  path,
  fileName,
  update,
  ymlFileLambdaContent,
  ymlFileSchemaContent,
  ymlFileMTContent,
  ymlDatasourceContent,
) => {
  const newFile = `${path}/${fileName}.yml`;
  fs.writeFileSync(newFile, '');
  if (update) {
    fs.appendFileSync(
      newFile,
      `${ymlFileLambdaContent}
${ymlFileSchemaContent}
${ymlDatasourceContent}
${ymlFileMTContent}`,
    );
  }
};

const prepareYmlFile = (
  lambdaName,
  filePath,
  ymlFileLambdaContent,
  ymlFileMTContent,
  ymlDatasourceContent,
  isMutation,
) => {
  ymlFileLambdaContent += `  ${lambdaName}:
    handler: ${filePath}
`;
  if (addFileSystemSupportToLambdas.indexOf(lambdaName) >= 0) {
    ymlFileLambdaContent += fileSystemConfig;
    ymlFileLambdaContent += vpcConfig;
  }

  if (applyVpcToLambdas.indexOf(lambdaName) >= 0) {
    ymlFileLambdaContent += vpcConfig;
  }
  // NOTE: Now we need every lambda in VPC for secure mongo connection,
  // so in future we won't have any type of internet attack on our database.

  const capitalizeDSName =
    lambdaName.charAt(0).toUpperCase() + lambdaName.substring(1);
  ymlDatasourceContent += `  - type: AWS_LAMBDA
    name: ${capitalizeDSName}
    description: 'Lambda DataSource'
    config:
      lambdaFunctionArn: 'arn:aws:lambda:\${aws:region}:\${self:custom.accountId}:function:\${self:service}-\${sls:stage}-${lambdaName}'
      serviceRoleArn: 'arn:aws:iam::\${self:custom.accountId}:role/\${self:custom.appSync.serviceRole}'
      functionName: ${lambdaName}
`;
  const queryType = isMutation ? 'Mutation' : 'Query';
  const field = removePostfixFromFile(lambdaName);
  ymlFileMTContent += `  - dataSource: ${capitalizeDSName}
    type: ${queryType}
    field: ${field}
    request: '${field}RequestMappingTemplate.txt'
    response: 'genericResponseMappingTemplate.txt'
`;

  return {
    ymlFileLambdaContent,
    ymlFileMTContent,
    ymlDatasourceContent,
  };
};

const convertDashToCamleCase = (name) => {
  const namesArr = name.split('-');
  let newName = namesArr[0];
  for (let i = 1; i < namesArr.length; i++) {
    newName += namesArr[i].charAt(0).toUpperCase() + namesArr[i].substring(1);
  }
  return newName;
};

module.exports = () => {
  console.log('Setting up appsync mapping templates and serverless yml files.');
  createMappingTemplatesDir();
  createGenericResponseMappingTemplate();
  readFiles(lambdaFunctionsDir);
};
