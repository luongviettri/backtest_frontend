// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/Lenovo/OneDrive/Desktop/frontend/backtest-frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/Lenovo/OneDrive/Desktop/frontend/backtest-frontend/node_modules/@vitejs/plugin-vue/dist/index.js";
import vueDevTools from "file:///C:/Users/Lenovo/OneDrive/Desktop/frontend/backtest-frontend/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Lenovo/OneDrive/Desktop/frontend/backtest-frontend/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    port: 5174,
    // Cổng bạn muốn sử dụng
    strictPort: true,
    // Nếu cổng này bận, Vite sẽ báo lỗi thay vì tự đổi cổng khác
    // THÊM VÀO: Cấu hình proxy
    proxy: {
      // Bất kỳ request nào bắt đầu bằng '/api' sẽ được chuyển tiếp
      "/api": {
        target: "http://127.0.0.1:8000",
        // Địa chỉ backend của bạn
        changeOrigin: true
        // Cần thiết để proxy hoạt động đúng
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMZW5vdm9cXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxmcm9udGVuZFxcXFxiYWNrdGVzdC1mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTGVub3ZvXFxcXE9uZURyaXZlXFxcXERlc2t0b3BcXFxcZnJvbnRlbmRcXFxcYmFja3Rlc3QtZnJvbnRlbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0xlbm92by9PbmVEcml2ZS9EZXNrdG9wL2Zyb250ZW5kL2JhY2t0ZXN0LWZyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnXG5cbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3Z1ZSgpLCB2dWVEZXZUb29scygpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTc0LCAvLyBDXHUxRUQ1bmcgYlx1MUVBMW4gbXVcdTFFRDFuIHNcdTFFRUQgZFx1MUVFNW5nXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSwgLy8gTlx1MUVCRnUgY1x1MUVENW5nIG5cdTAwRTB5IGJcdTFFQURuLCBWaXRlIHNcdTFFQkQgYlx1MDBFMW8gbFx1MUVEN2kgdGhheSB2XHUwMEVDIHRcdTFFRjEgXHUwMTExXHUxRUQ1aSBjXHUxRUQ1bmcga2hcdTAwRTFjXG5cbiAgICAvLyBUSFx1MDBDQU0gVlx1MDBDME86IENcdTFFQTV1IGhcdTAwRUNuaCBwcm94eVxuICAgIHByb3h5OiB7XG4gICAgICAvLyBCXHUxRUE1dCBrXHUxRUYzIHJlcXVlc3Qgblx1MDBFMG8gYlx1MUVBRnQgXHUwMTExXHUxRUE3dSBiXHUxRUIxbmcgJy9hcGknIHNcdTFFQkQgXHUwMTExXHUwMUIwXHUxRUUzYyBjaHV5XHUxRUMzbiB0aVx1MUVCRnBcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAnLCAvLyBcdTAxMTBcdTFFQ0JhIGNoXHUxRUM5IGJhY2tlbmQgY1x1MUVFN2EgYlx1MUVBMW5cbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLCAvLyBDXHUxRUE3biB0aGlcdTFFQkZ0IFx1MDExMVx1MUVDMyBwcm94eSBob1x1MUVBMXQgXHUwMTExXHUxRUQ5bmcgXHUwMTExXHUwMEZBbmdcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlYLFNBQVMsZUFBZSxXQUFXO0FBRXBaLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLGlCQUFpQjtBQUptTixJQUFNLDJDQUEyQztBQU81UixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQztBQUFBLEVBQzlCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxJQUNOLFlBQVk7QUFBQTtBQUFBO0FBQUEsSUFHWixPQUFPO0FBQUE7QUFBQSxNQUVMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQTtBQUFBLFFBQ1IsY0FBYztBQUFBO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
