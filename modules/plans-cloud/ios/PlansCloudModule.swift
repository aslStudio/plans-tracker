import CloudKit
import ExpoModulesCore

public class PlansCloudModule: Module {
  private func container() throws -> CKContainer {
    guard let identifier = Bundle.main.object(forInfoDictionaryKey: "PlansCloudContainer") as? String,
          !identifier.isEmpty else {
      throw NSError(domain: "PlansCloud", code: 1, userInfo: [NSLocalizedDescriptionKey: "iCloud не подключён в этой сборке"])
    }
    return CKContainer(identifier: identifier)
  }

  public func definition() -> ModuleDefinition {
    Name("PlansCloud")
    AsyncFunction("account") { () async throws -> String in
      let container = try self.container()
      guard try await container.accountStatus() == .available else {
        throw NSError(domain: "PlansCloud", code: 2, userInfo: [NSLocalizedDescriptionKey: "Войдите в iCloud в настройках устройства"])
      }
      return try await container.userRecordID().recordName
    }
    AsyncFunction("read") { () async throws -> [String: String]? in
      let database = try self.container().privateCloudDatabase
      do {
        let record = try await database.record(for: CKRecord.ID(recordName: "plans-tracker-v1"))
        guard let asset = record["payload"] as? CKAsset, let url = asset.fileURL else {
          throw NSError(domain: "PlansCloud", code: 3, userInfo: [NSLocalizedDescriptionKey: "Не удалось прочитать архив iCloud"])
        }
        let data = try Data(contentsOf: url)
        guard let payload = String(data: data, encoding: .utf8) else {
          throw NSError(domain: "PlansCloud", code: 4, userInfo: [NSLocalizedDescriptionKey: "Неверный формат архива iCloud"])
        }
        return ["payload": payload, "tag": record.recordChangeTag ?? ""]
      } catch let error as CKError where error.code == .unknownItem { return nil }
    }
    AsyncFunction("write") { (payload: String, expectedTag: String?) async throws -> String in
      let database = try self.container().privateCloudDatabase
      let id = CKRecord.ID(recordName: "plans-tracker-v1")
      let record: CKRecord
      do {
        record = try await database.record(for: id)
      } catch let error as CKError where error.code == .unknownItem {
        record = CKRecord(recordType: "PlansTrackerArchive", recordID: id)
      }
      guard record.recordChangeTag == expectedTag else {
        throw NSError(domain: "PlansCloud", code: 5, userInfo: [NSLocalizedDescriptionKey: "Архив изменён на другом устройстве. Данные на этом устройстве сохранены."])
      }
      let url = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + ".json")
      defer { try? FileManager.default.removeItem(at: url) }
      try Data(payload.utf8).write(to: url, options: [.atomic, .completeFileProtection])
      record["payload"] = CKAsset(fileURL: url)
      let result = try await database.modifyRecords(saving: [record], deleting: [], savePolicy: .ifServerRecordUnchanged, atomically: true)
      guard let saved = result.saveResults[id] else {
        throw NSError(domain: "PlansCloud", code: 6, userInfo: [NSLocalizedDescriptionKey: "iCloud не подтвердил сохранение"])
      }
      return try saved.get().recordChangeTag ?? ""
    }
  }
}
