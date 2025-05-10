/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import data from '@compilerConfigJsonSchema';
import React from 'react';

/**
 * Generate documentation for the Relay Compiler Config Schema dynamically from
 * the JSON schema, which is itself generated from our Rust structs/enums.
 *
 * The output is formatted to resemble the TypeScript type definitions since we
 * expect Relay users are intuitively familiar with TypeScript.
 *
 * This component will get executed during build time, so it should be written
 * defensively. It's okay for us to only handle a subset of the JSON schema as long
 * as we explicitly throw on any unhandled cases. If no config options are added
 * which exercise these unhandled cases, the build will fail and we can add support for
 * them at that point.
 */

// Some types have a name but are really just simple wrappers around other types
// or shapes. First we collect up these types and build a map redirecting them to
// their real type.
const INDIRECTIONS = {};

for (const [key, value] of Object.entries(data.definitions)) {
  // allOf is generally used to define a simple wrapper type
  if (value.allOf) {
    if (value.allOf.length !== 1) {
      throw new Error(
        'Expected allOf to only be used as a wrapper type wrapping a single type.',
      );
    }
    INDIRECTIONS[key] = value.allOf[0];
  }

  // $ref is used to define a type that is defined elsewhere
  if (value.$ref) {
    const typeName = value.$ref.split('/').pop();
    if (typeName != null) {
      INDIRECTIONS[key] = data.definitions[typeName];
    } else {
      throw new Error('Expected $ref to be a valid type name');
    }
  }

  // Just use inline types
  if (value.type === 'array') {
    INDIRECTIONS[key] = value;
  }
  if (value.type === 'string') {
    INDIRECTIONS[key] = value;
  }
  if (Array.isArray(value.type)) {
    INDIRECTIONS[key] = value.type;
  }
  if (key === 'DeserializableProjectSet') {
    INDIRECTIONS[key] = value;
  }
}

export default function CompilerConfig() {
  return <Schema schema={data} />;
}

function Schema({schema}) {
  return (
    <div className="json-schema">
      <SchemaDefinition definition={schema} name={schema.title} />
      {Object.entries(schema.definitions).map(([name, definition], index) => {
        return (
          <SchemaDefinition key={index} definition={definition} name={name} />
        );
      })}
    </div>
  );
}

function SchemaDefinition({definition, name}) {
  if (INDIRECTIONS[name]) {
    return null;
  }
  switch (definition.type) {
    case 'object':
      return <SchemaObjectDefinition definition={definition} name={name} />;
    case 'array':
      throw new Error('Expected array type to be handled as indirection');
    case 'string':
      if (definition.enum) {
        return <SchemaEnumDefinition definition={definition} name={name} />;
      }
      throw new Error('Expected string type to be handled as indirection');
    default:
      if (definition.$ref) {
        throw new Error('Expected $ref type to be handled as indirection');
      }
      if (definition.oneOf && definition.oneOf.length > 0) {
        return <SchemaOneOfDefinition definition={definition} name={name} />;
      }
      if (definition.anyOf && definition.anyOf.length > 0) {
        return <SchemaAnyOfDefinition definition={definition} name={name} />;
      }
      if (definition.allOf) {
        throw new Error('Expected allOf to be handled as indirection');
      }
      throw new Error('Unhandled definition type');
  }
}

function SchemaEnumDefinition({definition, name}) {
  return (
    <Definition name={name} description={definition.description}>
      <summary>
        type {name} {' ='}
      </summary>
      {definition.enum.map((item, index) => {
        return (
          <div className="property" key={index}>
            {item.description && (
              <div className="description">{' // ' + item.description}</div>
            )}
            {'|'}{' '}
            <span className="type">
              {'"'}
              {item}
              {'"'}
            </span>
          </div>
        );
      })}
    </Definition>
  );
}

function SchemaOneOfDefinition({definition, name}) {
  return (
    <Definition name={name} description={definition.description}>
      <summary>
        type {name} {' ='}
      </summary>
      {definition.oneOf.map((item, index) => {
        return (
          <div className="property" key={index}>
            {item.description && (
              <div className="description">{' // ' + item.description}</div>
            )}
            {'|'} <TypeRef prop={item} />
          </div>
        );
      })}
    </Definition>
  );
}
function SchemaAnyOfDefinition({definition, name}) {
  return (
    <Definition name={name} description={definition.description}>
      <summary>
        type {name} {' ='}
      </summary>
      {definition.anyOf.map((item, index) => {
        return (
          <div className="property" key={index}>
            {item.description && (
              <div className="description">{' // ' + item.description}</div>
            )}
            {'|'} <TypeRef prop={item} />
          </div>
        );
      })}
    </Definition>
  );
}

function SchemaObjectDefinition({definition, name}) {
  return (
    <Definition name={name} description={definition.description}>
      <summary>
        type {name} {' = {'}
      </summary>
      <div>
        {Object.entries(definition.properties).map(
          ([name, property], index) => {
            return (
              <SchemaProperty
                key={index}
                property={property}
                name={name}
                required={property.required?.includes(name)}
              />
            );
          },
        )}
      </div>
      {'}'}
    </Definition>
  );
}

function SchemaProperty({property, name, required}) {
  return (
    <div className="property">
      {property.description && (
        <div className="description">{' // ' + property.description}</div>
      )}
      <div>
        <span>
          {name}
          {required ? '' : '?'}
        </span>
        : <TypeRef prop={property} />
        <Default prop={property} />
      </div>
    </div>
  );
}

function Default({prop}) {
  if (prop.default) {
    return (
      <span className="default">
        {' = '}
        <RawJson json={prop.default} />
      </span>
    );
  }
  return null;
}

function RawJson({json}) {
  if (json === null) {
    return 'null';
  }
  switch (typeof json) {
    case 'string':
    case 'number':
    case 'boolean':
      return JSON.stringify(json);
    case 'object':
      if (Array.isArray(json)) {
        return (
          <span>
            [
            {json.map((item, index) => (
              <RawJson key={index} json={item} />
            ))}
            ]
          </span>
        );
      }
      return (
        <span>
          {'{'}
          {Object.entries(json).map(([key, value], index) => (
            <div key={index} className="inline-property">
              {key}: <RawJson json={value} />
            </div>
          ))}
          {'}'}
        </span>
      );
    default:
      throw new Error('Unexpected JSON type');
  }
}

function TypeRef({prop}) {
  return (
    <span className="type">
      <T prop={prop} />
    </span>
  );
}

function T({prop}) {
  if (typeof prop === 'boolean') {
    return String(prop);
  }
  if (prop.$ref) {
    const typeName = prop.$ref.split('/').pop();
    if (INDIRECTIONS[typeName]) {
      return <T prop={INDIRECTIONS[typeName]} />;
    }

    if (typeName != null) {
      return <a href={'#' + typeName}>{typeName}</a>;
    }
    throw new Error('Expected $ref to be a valid type name');
  }
  if (prop.type === 'array' && prop.items) {
    return (
      <>
        <T prop={prop.items} />
        {'[]'}
      </>
    );
  }
  if (Array.isArray(prop.type)) {
    return prop.type.join(' | ');
  }

  if (prop.enum) {
    return (
      <Join separator={' | '}>
        {prop.enum.map((item, i) => (
          <span key={i} className="type">
            {'"'}
            {item}
            {'"'}
          </span>
        ))}
      </Join>
    );
  }

  if (prop.allOf) {
    if (prop.allOf.length !== 1) {
      throw new Error('allOf should only have one item');
    }
    return <T prop={prop.allOf[0]} />;
  }
  if (prop.anyOf) {
    return (
      <Join separator={' | '}>
        {prop.anyOf.map((item, i) => (
          <T prop={item} key={i} />
        ))}
      </Join>
    );
  }

  if (Array.isArray(prop)) {
    return (
      <Join separator={' | '}>
        {prop.map((item, i) => (
          <span key={i} className="type">
            {item}
          </span>
        ))}
      </Join>
    );
  }

  switch (prop.type) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'null':
      return prop.type;
    case 'integer':
      // TODO: Clarify if this needs to be a unint8
      return 'number';
    case 'object':
      if (prop.additionalProperties) {
        return (
          <span className="type">
            {'{ [key: string]: '}
            <T prop={prop.additionalProperties} />
            {' }'}
          </span>
        );
      }
      return <InlineObject prop={prop} />;
    default:
      return prop.type ?? 'any';
  }
}

function InlineObject({prop}) {
  return (
    <span>
      {'{'}
      {Object.entries(prop.properties).map(([name, property], index) => {
        return (
          <div className="property" key={index}>
            {property.description && (
              <div className="description">{' // ' + property.description}</div>
            )}
            <span>{name}</span>
            : <T prop={property} />
            <Default prop={property} />
          </div>
        );
      })}
      {'}'}
    </span>
  );
}

function Definition({name, description, children}) {
  return (
    <div>
      <h2 id={name} className="definition-title">
        {name}
      </h2>
      {description && <p>{description}</p>}
      <div>{children}</div>
    </div>
  );
}

function Join({children, separator}) {
  const filtered = children.filter(Boolean);
  return (
    <>
      {filtered.map((child, idx) => (
        <React.Fragment key={idx}>
          {child}
          {idx < filtered.length - 1 && separator}
        </React.Fragment>
      ))}
    </>
  );
}
