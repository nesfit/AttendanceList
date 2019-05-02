import os from 'os';
import {
  find,
  identity,
  join,
  lensIndex,
  mapObjIndexed,
  over,
  propEq,
  pipe,
  prop,
  tap,
  values,
  when,
} from 'ramda';

const isIPv4AddressObj = propEq('family', 'IPv4');

export const findIPv4Addresses = find(isIPv4AddressObj);

export const getLocalIp = iface => pipe(
  os.networkInterfaces,
  prop(iface),
  findIPv4Addresses,
  when(identity, prop('address')),
)();

export const attrsToString = pipe(
  mapObjIndexed((val, key) => `${key}=${val}`),
  values,
  join('&')
);

export const pathToString = join('/');
