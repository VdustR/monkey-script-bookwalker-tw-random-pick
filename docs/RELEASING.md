# 建置與發布

發布時將原始碼與建置後的 `dist` 一起提交至 repository。使用者從預設分支安裝腳本，不建立 GitHub Release。

## 準備

1. 使用 Node.js 22.12 以上，執行 `npm ci` 安裝鎖定版本的相依套件。
2. 修改程式碼。需要升版時執行 `npm version patch --no-git-tag-version`，也可指定版本。此指令更新 `package.json` 與鎖定檔；Vite 會將版本寫入腳本的中繼資料。
3. 執行完整驗證與建置：

   ```sh
   npm run release
   ```

   執行順序為測試、Svelte 與 TypeScript 型別檢查、打包、產物驗證。任一步驟失敗就停止。
4. 安裝建置好的腳本，在真實網站確認分類與書單範圍、跨頁抽選、新分頁閱讀、重骰、複製、關閉與錯誤重試。記錄尚未驗證的操作；模擬測試不等於真實帳號驗證。
5. 檢查原始碼、鎖定檔、中繼資料與 `dist`。功能有變更時，同步更新 README 與相關截圖。

## 提交與推送

將相關變更與 `dist` 一起提交。例如：

```sh
git add src/ package.json package-lock.json vite.config.ts dist/ README.md docs/
git diff --cached --check
git diff --cached --stat
git commit -m "Release random reader update"
git push
```

若修改了測試或建置設定，也要加入同一份提交。`dist/` 必須保留在版本控制中；相依套件與臨時瀏覽器資料不要提交。

GitHub 的 `Build` 工作流程會在推送、pull request 與手動執行時：

1. 執行 `npm ci`。
2. 執行 `npm run release`。
3. 執行 `git diff --exit-code -- dist/`，確認提交的產物與重新建置結果一致。

CI 只有讀取 repository 的權限。預設分支更新且 CI 通過後，使用者可從 Raw 腳本連結安裝或手動更新。

## 本機確認產物

```sh
npm run release
git diff --exit-code -- dist/
```

第二行通過，表示重新建置的產物與已提交版本相同。第一次尚未提交的檔案需先檢查並提交，才能比較。
