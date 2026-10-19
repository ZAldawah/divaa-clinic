export default [
  {ignores:['.next/**','node_modules/**','test-results/**','playwright-report/**']},
  {files:['**/*.{js,jsx,mjs}'],languageOptions:{ecmaVersion:'latest',sourceType:'module',parserOptions:{ecmaFeatures:{jsx:true}}},rules:{'no-unreachable':'error','no-dupe-args':'error','no-dupe-keys':'error','no-constant-condition':['error',{checkLoops:false}],'valid-typeof':'error'}},
];
