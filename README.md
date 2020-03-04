# Horse Race

Horse race arcade style game, used as a demo at NodeConfEU 2018

Original authors:

- George Adams
- Musa Hamwala
- Thomas Leah

use:
`appsody run  --docker-options "--env-file=.env"` to start the game

Environment variables needed:

- `ADMIN_PASSWORD`
- `URL`
- `TWITTER_CONSUMER_SECRET`
- `TWITTER_CONSUMER_KEY`
- `CLOUDANT_URL`
- `CLOUDANT_USERNAME`
- `CLOUDANT_PASSWORD`
- `CLOUDANT_DOC`

Endpoints:

- <http://127.0.0.1:3000>
- <http://127.0.0.1:3000/admin/:ADMIN_PASSWORD>
- <http://127.0.0.1:3000/race>
- <http://127.0.0.1:3000/leaderboard>

## Twitter secrets

To get a twitter consumer secret and key to use with the app you need to go to
the following link

<https://developer.twitter.com/en/apps>

You will then need to create a new app filling in the necessary details.

## Running a Local CouchDB Instance

Start a CouchDB docker container using the following commands:

- `docker pull couchdb:latest`
- `docker run -d -p 5984:5984 --name my-couchdb couchdb:latest`

Go to <http://localhost:5984/_utils/#createAdmin/nonode@nohost> and then create
an admin account. Add those passwords to the .env file as CLOUDANT_USERNAME and
CLOUDANT_PASSWORD.

Inspect your docker container using the following commands

- `docker ps` and find the container ID of the my-couchdb container
- `docker inspect containerID`

Then copy the IPAddress field from under NetworkSettings.

Insert the IP address into the following string:

- <http://user:pass@IPADRRESS:5984>

then add the string to the .env file under CLOUDANT_URL.

Finally create a new database in your couchDB instance. Start by going to the
following url:

<http://localhost:5984/_utils/#/_all_dbs>

then click the Create Database. Add a name for your database and then click
Create Document. Copy the documents id and add this to the CLOUDANT_DOC field
in the .env file.

You should now be able to use a local couchdb instance instead of a Cloudant
database. Note that this instance is non-persistent so you will have to attach
a volume to your docker container using the `-v` option of docker run, more
information can be found at the following link:

- <https://github.com/apache/couchdb-docker#where-to-store-data>

## Deploying to OpenShift

- Start by running an `appsody build` (ensure you haven't got a .env file in
  your project as this wont be docker ignored and will end up in the docker
  image)

- Once the docker image has been built, rename it to
  `<dockerhub_username>/horse-race` and `docker push` it to docker hub and make
  sure its a public image.

- Login to an OpenShift instance and create a new project `oc new-project horse-race`

- Create a new application using `oc new-app --docker-image="<dockerhub_username>/horse-race:latest"` and expose a route with `oc svc/horse-race`

- Add the environment variables to the deployment config. You can do this individually by doing `oc set env dc/horse-race VAR="val"` or add the following to the deployment config yaml replacing the value fields with your environment variable values

```yaml
env:
  - name: ADMIN_PASSWORD
    value:
  - name: URL
    value: >-
      http://example.com
  - name: TWITTER_CONSUMER_KEY
    value:
  - name: TWITTER_CONSUMER_SECRET
    value:
  - name: CLOUDANT_USERNAME
    value:
  - name: CLOUDANT_PASSWORD
    value:
  - name: CLOUDANT_DOC
    value:
  - name: CLOUDANT_URL
    value: >-
      https://example.com
```

Notes:

- The URL environment variable is your address of the exposed route to your application.

- Appmetrics dash is only included in development and not in the image built using `appsody build`
