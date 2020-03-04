'use strict';

module.exports = function(Click) {
  const methodNames = ['upsert', 'deleteById', 'updateAll',
    'updateAttributes', 'createChangeStream', 'replace', 'replaceById',
    'upsertWithWhere', 'replaceOrCreate', 'find', 'findOne', 'count',
    'exists',
  ];

  methodNames.forEach(function(methodName) {
    disableMethods(Click, methodName);
  });
};

function disableMethods(Click, methodName) {
  if (methodName != 'updateAttributes')
    Click.disableRemoteMethod(methodName, true);
  else
    Click.disableRemoteMethod(methodName, false);
}
