// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'mongo-data'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Tắt quy tắc yêu cầu thêm tiền tố "I" cho các interface (ví dụ: IExample)
      '@typescript-eslint/interface-name-prefix': 'off',

      // Tắt quy tắc yêu cầu khai báo rõ ràng kiểu trả về cho các hàm
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Tắt quy tắc yêu cầu khai báo kiểu rõ ràng cho các hàm hoặc thuộc tính ở biên giới module (export)
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Tắt quy tắc cấm sử dụng kiểu "any", giúp bạn tự do sử dụng kiểu "any" khi cần
      '@typescript-eslint/no-explicit-any': 'off',

      // Tắt quy tắc cấm các biểu thức không có tác dụng (expression statements)
      '@typescript-eslint/no-unused-expressions': 'off',

      // Tắt quy tắc yêu cầu sử dụng "import" thay vì "require" để nhập các module
      '@typescript-eslint/no-require-imports': 'off',

      // Tắt quy tắc yêu cầu không sử dụng kiểu đối tượng trống "{}"
      '@typescript-eslint/no-empty-object-type': 'off',

      // Cảnh báo về các biến không sử dụng, nhưng bỏ qua các biến có tên bắt đầu bằng dấu gạch dưới "_"
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',  // Kiểm tra tất cả các tham số hàm
          argsIgnorePattern: '^_',  // Bỏ qua các tham số có tên bắt đầu bằng "_"
          caughtErrors: 'all',  // Kiểm tra tất cả các lỗi được bắt
          caughtErrorsIgnorePattern: '^_',  // Bỏ qua các lỗi bắt có tên bắt đầu bằng "_"
          destructuredArrayIgnorePattern: '^_',  // Bỏ qua các phần tử destructured có tên bắt đầu bằng "_"
          varsIgnorePattern: '^_',  // Bỏ qua các biến có tên bắt đầu bằng "_"
          ignoreRestSiblings: true  // Bỏ qua kiểm tra các biến còn lại trong đối tượng khi destructuring
        }
      ],

      // Sắp xếp các import theo thứ tự, đảm bảo các import trong mã được tổ chức rõ ràng
      'simple-import-sort/imports': 'error',

      // Sắp xếp các export theo thứ tự
      'simple-import-sort/exports': 'error',

      // Đảm bảo tất cả các import được đặt ở đầu file
      'import/first': 'error',

      // Đảm bảo có dòng trống sau các import để phân tách rõ ràng giữa phần import và phần mã thực thi
      'import/newline-after-import': 'error',

      // Cấm import các module hoặc thành phần từ module nhiều lần
      'import/no-duplicates': 'error',

      // Cảnh báo khi có promise không được xử lý (floating promise)
      // Điều này giúp đảm bảo rằng tất cả các promises đều được await hoặc xử lý
      '@typescript-eslint/no-floating-promises': 'warn',

      // Cảnh báo khi truyền một argument không an toàn (unsafe argument) vào một hàm
      // Điều này giúp tránh lỗi khi các giá trị không hợp lệ hoặc không kiểm tra kiểu được truyền vào hàm
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // Tắt quy tắc kiểm tra việc gán giá trị không an toàn (unsafe assignment)
      // Điều này cho phép bạn gán giá trị mà không gặp cảnh báo về việc gán kiểu không an toàn
      '@typescript-eslint.io/rules/no-unsafe-assignment': 'off',

      // Tắt quy tắc kiểm tra việc gọi các phương thức trên các giá trị không an toàn (unsafe call)
      // Điều này cho phép bạn gọi phương thức trên giá trị mà không kiểm tra tính an toàn của kiểu
      '@typescript-eslint/no-unsafe-call': 'off',

      // Cấu hình Prettier để đảm bảo mã nguồn có định dạng phù hợp với hệ điều hành sử dụng
      // 'endOfLine: auto' sẽ tự động sử dụng đúng kiểu kết thúc dòng phù hợp với hệ điều hành (LF cho Linux/macOS, CRLF cho Windows)
      'prettier/prettier': [
        'error',  // Báo lỗi nếu mã không tuân thủ quy tắc Prettier
        {
          'endOfLine': 'auto'  // Tự động sử dụng đúng kiểu kết thúc dòng theo hệ điều hành
        }
      ]
    },
  }

);