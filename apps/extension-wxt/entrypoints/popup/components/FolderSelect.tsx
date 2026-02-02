import type { FolderResponseData } from "@repo/api";

type FolderSelectProps = {
  folders: FolderResponseData[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

function FolderSelect({ folders, value, onChange }: FolderSelectProps) {
  const isEmpty = folders.length === 0;

  return (
    <div className="folder-select">
      <label htmlFor="folderSelect">폴더 선택</label>
      <select
        id="folderSelect"
        value={value}
        onChange={onChange}
        disabled={isEmpty}
      >
        {isEmpty ? (
          <option value="">폴더가 없습니다</option>
        ) : (
          folders.map((folder) => (
            <option key={folder.folderUuid} value={folder.folderUuid}>
              {folder.folderName}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

export default FolderSelect;
