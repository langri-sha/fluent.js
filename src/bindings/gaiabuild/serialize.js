'use strict';

import { L10nError } from '../../lib/errors';

export function serializeEntries(lang, langEntries, sourceEntries) {
  const errors = [];
  const entries = Object.keys(sourceEntries).map(id => {
    const sourceEntry = sourceEntries[id];
    const langEntry = langEntries[id];

    if (!langEntry) {
      errors.push(new L10nError(
        '"' + id + '"' + ' not found in ' + lang.code, id, lang));
      return serializeEntry(sourceEntry, id);
    }

    if (!areEntityStructsEqual(sourceEntry, langEntry)) {
      errors.push(new L10nError(
        '"' + id + '"' + ' is malformed in ' + lang.code, id, lang));
      return serializeEntry(sourceEntry, id);
    }

    return serializeEntry(langEntry, id);
  });

  return [errors, entries];
}

function serializeEntry(entry, id) {
  if (typeof entry === 'string') {
    return { $i: id, $v: entry };
  }

  const node = {
    $i: id,
  };

  if (entry.value !== null) {
    node.$v = entry.value;
  }

  if (entry.index !== null) {
    node.$x = entry.index;
  }

  for (let key in entry.attrs) {
    node[key] = serializeAttribute(entry.attrs[key]);
  }

  return node;
}

function serializeAttribute(attr) {
  if (typeof attr === 'string') {
    return attr;
  }

  const node = {};

  if (attr.value !== null) {
    node.$v = attr.value;
  }

  if (attr.index !== null) {
    node.$x = attr.index;
  }

  return node;
}

function resolvesToString(entity) {
  return typeof entity === 'string' || // a simple string
    Array.isArray(entity.value) ||     // a complex string
    entity.index !== null;             // a dict with an index
}

function areEntityStructsEqual(entity1, entity2) {
  if (resolvesToString(entity1) && resolvesToString(entity2)) {
    return true;
  }

  const keys1 = Object.keys(entity1);
  const keys2 = Object.keys(entity2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let i = 0; i < keys1.length; i++) {
    if (keys2.indexOf(keys1[i]) === -1) {
      return false;
    }
  }

  return true;
}