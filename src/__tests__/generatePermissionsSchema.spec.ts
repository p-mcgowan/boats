import generatePermissionsSchema from '../generatePermissionsSchema';
import _ from 'lodash';

describe('generatePermissionsSchema', () => {
  let bundledJson: any;

  beforeEach(() => {
    bundledJson = {
      components: {
        schemas: {
          MyExistingSchema: { type: 'string' }
        }
      },
      paths: {
        '/path1': {
          get: { nobody: 'cares' }
        },
        '/path2': {
          get: { who: 'cares' },
          post: { nobody: 'cares at all' }
        }
      }
    };
  });

  const makeExpectedJson = (schemaName: string, permissions: string[]) => {
    const originalJson = _.cloneDeep(bundledJson)

    return {
      ...originalJson,
      components: {
        ...originalJson.components,
        schemas: {
          ...originalJson.components.schemas || {},
          [schemaName]: {
            type: 'string',
            enum: permissions
          }
        }
      }
    };
  };

  it('does not modify schema when the option is disabled', () => {
    const previousJson = _.cloneDeep(bundledJson);
    expect(generatePermissionsSchema(bundledJson, '')).toEqual(previousJson);
    expect(generatePermissionsSchema(bundledJson, undefined)).toEqual(previousJson);
  });

  it('does not modify schema when the option is enabled but there are no permissions', () => {
    const previousJson = _.cloneDeep(bundledJson);
    expect(generatePermissionsSchema(bundledJson, 'Permissions')).toEqual(previousJson);
  });

  it('adds permissions when the option is enabled', () => {
    const schemaName = 'MyPermissions';
    const permissions = [
      'coolPermission1',
      'coolerPermission2',
      'awesomePermission3'
    ];

    bundledJson.paths['/path1'].get['x-permission'] = permissions[0];
    bundledJson.paths['/path2'].get['x-permission'] = permissions[1];
    bundledJson.paths['/path2'].post['x-permission'] = permissions[2];

    const expectedJson = makeExpectedJson(schemaName, permissions);
    expect(generatePermissionsSchema(bundledJson, schemaName)).toEqual(expectedJson);
  });

  it('adds permissions when there are no schemas at all', () => {
    const schemaName = 'MySwaggerPermissions';
    const permissions = [
      'coolPermission4',
      'coolerPermission5',
      'awesomePermission6'
    ];

    delete bundledJson.components.schemas;
    bundledJson.paths['/path1'].get['x-permission'] = permissions[0];
    bundledJson.paths['/path2'].get['x-permission'] = permissions[1];
    bundledJson.paths['/path2'].post['x-permission'] = permissions[2];

    const expectedJson = makeExpectedJson(schemaName, permissions);
    expect(generatePermissionsSchema(bundledJson, schemaName)).toEqual(expectedJson);
  });

  it('breaks when the autogenerated schema will overwrite an exisitng schema', () => {
    const schemaName = 'MyExistingSchema';

    bundledJson.paths['/path1'].get['x-permission'] = 'readPath1Get';

    expect(() => generatePermissionsSchema(bundledJson, schemaName)).toThrowError(
      `Schema named "${schemaName}" already exists. `
      + 'Make sure to change "permissionConfig.generateSchemaNamed" to a schema name you are not already using.'
    );
  });
});
