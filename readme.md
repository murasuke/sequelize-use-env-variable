# sequelizeの接続設定を環境変数環境変数から設定する方法(config.use_env_variable)

## 前書き

* sequelizeはcliを利用することで、設定ファイル(config.json)、Model、Migration、Seederのひな形を作ることができて便利です。

* ひな形の'./models/index.js'を見ると下記の箇所で環境変数から読み込むコードがありますが、デッドコードになっておりそのままでは使えません。
```
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
}
```

* 環境変数から値を取得するようにconfig.jsonファイルを変更します。

## 準備

* dockerでmysqlをインストールして使うため、先にインストールしておいてください。

* sequelizeをインストールします。

```bash
npm init -y

npm install sequelize sequelize-cli mysql1
```

* mysqlをdockerでインストールします
```
docker run　～
```

### migration

```

```
npx sequelize model:generate --name User --attributes name:string,birth:date,email:string
npx sequelize seed:generate --name user

### 実行

```
export DB_CONNECTION_URI='mysql://root:password@localhost:3306/test_db'
```