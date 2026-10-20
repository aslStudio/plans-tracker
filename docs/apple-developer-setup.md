# Новый Apple Developer аккаунт: настройка plans-tracker

В проекте уже стоят следующие идентификаторы. Регистрируйте их в **своей новой команде Apple Developer**. Если Apple сообщит, что Bundle ID занят, выберите свой уникальный префикс и замените его одновременно в `app.json`, `.env.local`, iOS-проекте, коде виджетов и нативных модулей **до регистрации остальных идентификаторов**.

| Что | Значение в проекте |
| --- | --- |
| Основное приложение | `app.planstracker` |
| Расширение виджета | `app.planstracker.widget` |
| App Group для приложения и виджета | `group.app.planstracker.widget` |
| iCloud Container | `iCloud.app.planstracker` |
| Тип записи CloudKit | `PlansTrackerArchive` |
| Поле архива | `payload` (Asset) |

## 1. Проверьте команду и узнайте Team ID

1. Откройте [Apple Developer Account](https://developer.apple.com/account/) под новым Apple Account. Проверьте, что есть действующее членство **Apple Developer Program**, а не только бесплатная `Personal Team`: для iCloud, App Groups, подписи и публикации нужна команда с соответствующими возможностями. [Apple: виды учётных записей](https://developer.apple.com/help/account/basics/about-your-developer-account/).
2. В **Membership details** найдите десятисимвольный **Team ID** и сохраните его. Старый Team ID из проекта удалён. [Apple: где найти Team ID](https://developer.apple.com/help/glossary/team-id/).
3. Если App Store Connect просит принять новое соглашение, сделайте это от имени Account Holder. Без действующего соглашения создать карточку приложения может быть нельзя. [Apple: создание карточки](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app).

## 2. Создайте iCloud Container

В **Certificates, Identifiers & Profiles → Identifiers → +** выберите **iCloud Containers**, введите описание `plans-tracker` и идентификатор `iCloud.app.planstracker`, затем **Continue → Register**. Это отдельный объект; создание App ID само по себе контейнер не создаёт. [Apple: Create an iCloud container](https://developer.apple.com/help/account/identifiers/create-an-icloud-container).

## 3. Создайте App Group

В том же разделе **Identifiers → + → App Groups** зарегистрируйте `group.app.planstracker.widget`. Группа нужна для передачи данных из приложения в виджет. [Apple: Register an app group](https://developer.apple.com/help/account/identifiers/register-an-app-group/).

## 4. Зарегистрируйте два явных App ID

1. **Identifiers → + → App IDs → App**: создайте **Explicit App ID** `app.planstracker`. Включите **App Groups** и назначьте `group.app.planstracker.widget`. Включите **iCloud**, выберите **Include CloudKit support** и назначьте `iCloud.app.planstracker`. [Apple: регистрация App ID](https://developer.apple.com/help/account/identifiers/register-an-app-id/), [настройка iCloud и App Groups](https://developer.apple.com/help/account/identifiers/enable-app-capabilities/).
2. У текущего iOS target есть entitlement `aps-environment`, поэтому для основного App ID также включите **Push Notifications**, чтобы профиль подписи соответствовал entitlement. Приложение сейчас планирует локальные уведомления; отдельный APNs Auth Key (`.p8`) и сервер для них не нужны. [Apple: APNs capability](https://developer.apple.com/documentation/usernotifications/registering-your-app-with-apns), [локальные уведомления](https://developer.apple.com/documentation/usernotifications/scheduling-a-notification-locally-from-your-app).
3. Повторите **Identifiers → + → App IDs → App** для **Explicit App ID** `app.planstracker.widget`. Включите **App Groups** и назначьте ту же группу `group.app.planstracker.widget`. Для виджета в этом проекте CloudKit и Push Notifications не требуются.

## 5. Привяжите команду к проекту и подпишите оба target

1. В [app.json](../app.json) добавьте в `expo.ios` поле `"appleTeamId": "ВАШ_TEAM_ID"`. Проверьте `bundleIdentifier: app.planstracker` и App Group. Контейнер задаётся переменной `PLANS_TRACKER_ICLOUD_CONTAINER=iCloud.app.planstracker` в локальном `.env.local`; если вы выбрали иной идентификатор, измените её. [Expo SDK 57: `appleTeamId` и iOS config](https://docs.expo.dev/versions/v57.0.0/config/app/).
2. Откройте `ios/planstracker.xcworkspace` в Xcode. В **Settings → Accounts** войдите в новый Apple Account. В **Signing & Capabilities** выберите новую Team и **Automatically manage signing** для **planstracker** и **CalendarWidget**. Проверьте соответствие Bundle ID каждому target и наличие App Groups у обоих. Xcode может создать development certificate и provisioning profiles автоматически; вручную создавать их заранее не обязательно. [Apple: automatic signing](https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices), [development profile](https://developer.apple.com/help/account/provisioning-profiles/create-a-development-provisioning-profile/).
3. Если меняли capabilities уже после создания профилей, дайте Xcode обновить профили или регенерируйте вручную созданные. [Apple: обновление профилей](https://developer.apple.com/help/account/provisioning-profiles/edit-download-or-delete-profiles/).

## 6. Проверьте CloudKit и подготовьте production

1. Соберите подписанную development-версию на устройстве, войдите на устройстве в iCloud, откройте в приложении **Настройки → Память**, подключите iCloud и сохраните архив. Первая запись создаст в **development** схеме CloudKit тип `PlansTrackerArchive` и поле `payload` типа **Asset**. Данные хранятся в private database; record ID — `plans-tracker-v1`.
2. В [CloudKit Console](https://icloud.developer.apple.com/) выберите `iCloud.app.planstracker`, откройте **CloudKit Database → Schema / Record Types** и проверьте тип и поле. [Apple: CloudKit Database app](https://developer.apple.com/documentation/cloudkit/managing-icloud-containers-with-cloudkit-database-app).
3. **До TestFlight или App Store релиза** в CloudKit Console выберите **Deploy Schema Changes → Deploy**. Production-сборки получают production-схему; development-схема сама туда не переносится. Развёртывание переносит структуру, но не тестовые записи. [Apple: Deploying a schema](https://developer.apple.com/documentation/cloudkit/deploying-an-icloud-container-s-schema).

## 7. Создайте карточку приложения для TestFlight/App Store

В [App Store Connect](https://appstoreconnect.apple.com/) откройте **Apps → + → New App**, выберите iOS, название, основной язык, Bundle ID **`app.planstracker`** и свой SKU. Отдельная карточка для виджета не нужна: он поставляется внутри приложения. Затем загрузите подписанную сборку и проверьте в TestFlight работу виджета и iCloud на устройстве с другим Apple Account. [Apple: Add a new app](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app).

### Проверка перед первой загрузкой

- В новой команде есть оба App ID, App Group и iCloud Container с точными значениями из таблицы.
- Основное приложение и виджет подписываются **одной новой Team** и имеют одну App Group.
- Подписанная development-сборка пишет архив в CloudKit, а виджет видит данные приложения.
- Тип `PlansTrackerArchive` с `payload` развёрнут в production до TestFlight/App Store.

Локальная установка CocoaPods — отдельный шаг после настройки аккаунта. На этой машине предыдущий `pod install` упирался в отсутствие `cmake` и доступа к GitHub для Hermes; после устранения этих условий запустите `pod install` из папки `ios`.
