import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

/**
 * Preset ESLint do FinDash (flat config, ESLint 9).
 * Consumo nos apps/pacotes: `export { default } from '@findash/config/eslint';`
 */
export default tseslint.config(
  // Artefatos de build e tipos federados gerados (T-1.3+) não são lintados.
  { ignores: ['**/dist/**', '**/@mf-types/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    rules: {
      // Convenção: prefixo _ marca descarte intencional (args, destructuring).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  // Desliga regras estilísticas que conflitam com o Prettier — sempre por último.
  prettier,
);
