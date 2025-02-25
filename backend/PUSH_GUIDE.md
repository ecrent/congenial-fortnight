# Pushing Changes After Moving Folders to the Backend Folder

1. Check your changes:
   ```bash
   git status
   ```
2. Stage all changes (moved folders will appear as deletions and additions):
   ```bash
   git add -A
   ```
3. Commit the changes:
   ```bash
   git commit -m "Moved all folders to the backend folder"
   ```
4. Push the commit:
   ```bash
   git push
   ```

Tip: To preserve file history during moves, use `git mv` rather than manually moving files.
