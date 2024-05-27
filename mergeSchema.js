// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const util = require('util');
const awsScalars = [
  'scalar AWSDate',
  'scalar AWSTime',
  'scalar AWSDateTime',
  'scalar AWSTimestamp',
  'scalar AWSEmail',
  'scalar AWSJSON',
  'scalar AWSURL',
  'scalar AWSPhone',
  'scalar AWSIPAddress',
  'directive @aws_subscribe(mutations: [String!]!) on FIELD_DEFINITION',
  'directive @aws_api_key on OBJECT | FIELD_DEFINITION',
  'directive @aws_cognito_user_pools on OBJECT | FIELD_DEFINITION',
];
const mergedSchemaFileName = 'schema.graphql';
if (fs.existsSync(mergedSchemaFileName)) {
  fs.unlinkSync(mergedSchemaFileName);
}

module.exports = () => {
  const awsScalarString = awsScalars.join('\r\n');
  const createAWSScalarFile = util.promisify(fs.appendFile);
  createAWSScalarFile('aws-scalar.graphql', awsScalarString).then(() => {
    process.exec(
      'graphql-schema-utilities -s "{./aws-scalar.graphql,src/functions/**/*.graphql}" -o "schema-temp.graphql"',
      (err) => {
        if (err) {
          fs.unlinkSync('aws-scalar.graphql');
          throw new Error(`Error while generating schema file. ${err}`);
        } else {
          const readFile = util.promisify(fs.readFile);
          readFile('schema-temp.graphql', { encoding: 'utf8' }).then((file) => {
            let result = file;
            awsScalars.forEach((scalar) => {
              result = result.replace(scalar, '');
            });
            const createSchemaFile = util.promisify(fs.appendFile);
            createSchemaFile(mergedSchemaFileName, result).then(() => {
              fs.unlinkSync('schema-temp.graphql');
              fs.unlinkSync('aws-scalar.graphql');
              console.log(
                `New ${mergedSchemaFileName} file generated successfully.`,
              );
            });
          });
        }
      },
    );
  });
};
