"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var idCounter = 0;

var noop = exports.noop = function noop() {};

// eslint-disable-next-line no-plusplus
var uuid = exports.uuid = function uuid() {
  return ++idCounter;
};