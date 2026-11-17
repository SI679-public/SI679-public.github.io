---
title: Week 09 — Deploying Our App
---

# Week 09 · Deploying Our App

Deployment is a deep area and we will only scratch the surface. The deployment approach we'll take today is more manual than how things are done typically (today's version is quicker in the short run but cumbersome in the long run for a deployment that receives frequent code updates and configuration changes). Today's version is good enough for demos, MVPs, and alpha/beta testing, but it's not what you'd expect to see for production-level deployments. These are beyond the scope of this course and I wouldn't be the right person to teach you about them anyway.

We will be using Google Cloud for this, which is one of the Big Three for general cloud infrastructure: Amazon Web Services (AWS), Google Cloud Platform (GCP), and Microsoft Azure. We are using GCP because I find the Developer Experience of AWS to be horrendous and I assume that Microsoft is going to try to trick me into joining their cult. GCP has the smallest market share of the Big Three (roughly AWS: 30%, Azure: 20%, Google: 10%).

There are other approaches, ranging from WYSIWYG website builders with significant extensibility and integrations like SquareSpace, WIX, and WebFlow, to turnkey hosting solutions like Heroku or Digital Ocean, to running a web app off of your own hardware out of your broom closet.

Cloud service providers like AWS, GCP, and Azure occupy a niche that has turned out to be very attractive to developers who want a great deal of flexibility and control over every aspect of the application but are happy to offload the headaches of server scaling, load balancing, basic network security, etc.

## This week's goals

- Get an app ready to leave your laptop: setting up the environment and configuring the code to build one server for the API *and* the client
- Run your own server in the cloud, and keep the app running 24/7
- Put the app behind a real domain name (`<your-uniqname>.si679.net`), with HTTPS
- Understand what costs what, and how to stop paying when you don't need it.

## The big picture

That was then:

![Three panels from the week 7 CORS lecture, each showing a browser, the client at localhost:5173 and the server at localhost:6790. Left: the browser requests the client from the client server. Middle: the browser runs the client code, with no traffic unless a request is made. Right: the browser makes a request to the server, with origin http://localhost:5173](images/local-dev-client-and-server.png)

^^ developing locally. Image from CORS lecture. Not shown: Mongo, but it would be connected to the server at `localhost:27017`.

This is now:

![The deployed app. The browser asks a DNS server for xxx.si679.net and gets back the VM's IP address, 104.197.xxx.xxx. Inside a GCP VM (e2-small), the browser talks to nginx (xxx.si679.net, ports 80 and 443), which works with certbot and passes requests on to the server at localhost:6790. The server hands out the client with express.static() and sends defined routes to the API routes, which talk to MongoDB at localhost:27017](images/deployed-vm-big-picture.png)

^^ ... or soon at least. Same code, arranged differently and in a different environment for deployment.

## Before class: your Google Cloud credits

If you haven't yet, do the four steps from [the Canvas announcement](https://umich.instructure.com/courses/860928/discussion_topics/3031927) now: request the
coupon, redeem it, create a GCP project using the SI 679 billing account, and enable
Compute Engine.

::: info Why credits?
Google won't let you create a server without a billing account, which normally
means a credit card. The coupon, which I requested and received through the Google Education program, gives you a $50 billing account with no card. If it runs out, your VM simply stops: you can't be charged.
:::

## Part 1: Getting the app ready to leave your laptop

### Clone the starter

Accept the [Classroom 50 assignment](https://classroom50.org/SI679-Classroom-F26/si-679-f-26/assignments/week09-nyt/accept?k=mjt5rszh) and clone it to your machine. It's the final version of last week's lecture code. Today we add no functionality. We make a few tweaks to prepare for deployment then we deploy!

Set it up as usual: `npm install` in both `server/` and `client/`, and copy
`.env.example` to `.env` in both. No need to run anything now, and don't worry about the `JWT_SECRET` replacement. We'll do that in the deployment environment shortly, where it's truly needed.

### Everything that varies goes in the environment

Things that change between your laptop and the server don't belong in the
code. We already did this for `JWT_SECRET` and `CLIENT_ORIGIN`, but the port, the
database address and the database name are still hard-coded.

Add three settings to `server/src/config.ts`, each with today's value as
its default, so nothing changes on your laptop:

::: code-group
<<< ../../../code/week09-deployment/week09-lecture/server/src/config.ts#settings{ts} [server/src/config.ts]
:::

Then use them. In `db.ts`, the two constants at the top go, and `connect()`
takes its defaults from the settings (the tests still pass their own):

::: code-group
<<< ../../../code/week09-deployment/week09-lecture/server/src/db/db.ts#connect{ts} [server/src/db/db.ts]
:::

And in `index.ts`, get the port from the environment rather than app code:

::: code-group
<<< ../../../code/week09-deployment/week09-lecture/server/src/index.ts{5,7 ts:line-numbers} [server/src/index.ts]
:::

Finally, add those env vars with default (i.e., local dev friendly) values in `server/.env.example`, so whoever sets up the next machine knows they exist and what they should look like:

::: code-group
<<< ../../../code/week09-deployment/week09-lecture/server/.env.example{ini} [server/.env.example]
:::

We will change the values in the `.env` we create on the deployment virtual machine when we get to that point.

### One server for everything

`npm run build` in `client/` turns our TypeScript and React into plain HTML,
CSS and JavaScript in `client/dist/`. That's all the browser actually needs;
Vite's dev server was building it on the fly. Express can hand those files
out like any others. In `server/src/app.ts`, first import Node's `path`
module at the top:

::: code-group
<<< ../../../code/week09-deployment/week09-lecture/server/src/app.ts#imports{1 ts} [server/src/app.ts]
:::

Then add this after the routers and just before the error handler:

::: code-group
<<< ../../../code/week09-deployment/week09-lecture/server/src/app.ts#static{ts} [server/src/app.ts]
:::

Anything that isn't an API route is now a file from `client/dist`, starting
with `index.html` at `/`. One server, one address: the client and the API
share an origin, so in production there's no CORS to worry about.

`import.meta.dirname` is the folder the running file is in: `server/src` when
we run with `tsx`, `server/dist` when we run the build. Either way, two levels
up is the repo, and `client/dist` is under it.

Now the client has to find the API without being told. In
`client/src/api/client.ts`, if there's no `VITE_API_URL`, use the address the
page itself came from.

Export it, as we'll need this URL elsewhere:

::: code-group
<<< ../../../code/week09-deployment/week09-lecture/client/src/api/client.ts#api-url{8-9 ts} [client/src/api/client.ts]
:::

`socket.ts` imports it rather than reading `.env` itself, so the two can't
disagree:

::: code-group
<<< ../../../code/week09-deployment/week09-lecture/client/src/api/socket.ts#connect{4 ts} [client/src/api/socket.ts]
:::

### A health check

One more route in `server/src/app.ts`, before the routers:

::: code-group
<<< ../../../code/week09-deployment/week09-lecture/server/src/app.ts#health{ts} [server/src/app.ts]
:::

With the server running locally (`npm run dev` in `server/`), `curl http://localhost:6790/health` answers `{"ok":true}`: a quick way to
ask "is the app up?", now and on the server.

### Run it like production, on your laptop

Running the app will be a bit different now, compared to recent weeks. For one, we'll only need two terminals rather than three. First mongo (probably skipping `mkdir`):

```shell
# macOS / Linux
mkdir -p ~/data/mdata
mongod --dbpath ~/data/mdata
```

```shell
# Windows
mkdir c:\data\mdata
mongod --dbpath c:\data\mdata
```

Seed the DB:

```shell
cd server
npm run seed
```

:::tip Kill `npm run dev`
If you're running `npm run dev` anywhere, kill it or the ports you need will likely not be available. Not sure? Hit `localhost:5173` and `localhost:6790` to see if anything's there.
:::

Then, for the second terminal, build both halves, then start the server the way the VM will (`npm start`):

```bash
cd client && npm run build
cd ../server && npm run build && npm start
```

Open `http://localhost:6790` (not 5173: no separate Vite server today!). The whole app should work from one address, live updates over sockets included. What doesn't work here is "hot reload"--code changes require killing the server, rebuilding, and restarting.

:::tip What about CORS?
With both the client and server originating from the same address, we don't need CORS. However you would still need it for local development if you want to use hot reloading. So we'll leave it in.
:::

### Commit and push

Your virtual machine (VM) will get the code from GitHub, so push it now. We'll get it onto the VM shortly.

## Part 2: A server of your own

### Create the VM

Starting at your project's home screen, click the hamburger menu in the upper left...

![Google Cloud console welcome page for a project, with the hamburger menu button in the top left highlighted](images/gcp-menu-button.png)

... then Compute Engine / VM instances.

![The console menu open with Compute Engine selected, and VM instances highlighted in its submenu](images/gcp-menu-vm-instances.png)

If you haven't already, Enable the API.

![The Compute Engine API product page, with the Enable button highlighted](images/compute-engine-api-enable.png)

Once that's done (could take up to a minute), click "Create instance."

![The empty VM instances page, with the Create instance button highlighted](images/vm-instances-create.png)

Give it a name you'll remember and take the defaults for Region and Zone.

![Create an instance, Machine configuration: the Name field filled in, Region us-central1 (Iowa) and Zone Any highlighted. The summary on the left shows the default boot disk, Debian GNU/Linux 13 (trixie)](images/create-vm-name-region.png)

Leave "E2" selected for the main machine type and select "e2-small" for the Preset.

![Machine configuration with the E2 series selected and the e2-small preset (2 vCPU, 2 GB memory) highlighted; the monthly estimate shows $13.23](images/create-vm-e2-small.png)

::: info Why e2-small?
About $17 a month all in (the VM, its IP address and its disk), so $50 lasts
well past Demo Day. The default if you change nothing, e2-medium, costs about $29. The
free e2-micro has too little memory for MongoDB, Node and an `npm install` at once.
:::

We'll leave the defaults for OS and storage, Data protection, Observability, Security, and Advanced. But we will click boxes in Networking to enable HTTP and HTTPS traffic. After clicking those, click "Create."

![The Networking section with Allow HTTP traffic and Allow HTTPS traffic checked, and the Create button highlighted](images/create-vm-firewall-http-https.png)

Your VM is ready!

![The VM instances list showing the new VM running in us-central1-c, with its internal and external IP addresses](images/vm-instances-running.png)

We need to make the VM's IP *static* or it could change every time you restart it. For a DNS name like `mwnewman.si679.net` to work, it has to be mapped to an unchanging, or "*static*" IP address. To reserve one of these, hit the hamburger menu again and navigate to VPC Network / IP addresses.

![The console menu with VPC Network selected, and IP addresses highlighted in its submenu](images/gcp-menu-ip-addresses.png)

Find the *external* IP address for the VM you just created and click the 3 dots to select "Promote to static IP address."

![The IP addresses list: the External address's actions menu is open, showing Promote to static IP address](images/ip-promote-to-static.png)

Give it a name you'll remember (what is this IP address for?) and, optionally, a description. Then click "Reserve."

![The Promote IP address dialog, with the name si679-ip and a short description filled in, and the Reserve button](images/ip-promote-dialog.png)

You've got a static IP address!

![The IP addresses list now showing the external address with the name si679-ip, and a message that it was created](images/ip-static-reserved.png)

Now enter your IP address and your uniqname in the [Google Form](https://forms.gle/3o9QRaDu8t635Gwt6) we will use to create your DNS entry at `<uniqname>.si679.net`.

![The si679.net DNS registration form, with fields for your uniqname and your VM's static external IP address](images/dns-google-form.png)

## Part 3: Installing software

### SSH in

Click **SSH** next to your VM: a terminal on your VM opens in the browser.

![The VM instances list, with the SSH button for the VM highlighted](images/vm-ssh-button.png)

Authorize it when asked.

![The SSH-in-browser window asking to authorize SSH-in-browser to connect to VMs, with Authorize and Cancel buttons](images/ssh-authorize.png)

You should see a Linux terminal. This is running on your VM, so anything you do in this terminal will affect the VM.

### Updates and git

`apt` is the Debian Linux OS package manager, so the first thing to do is make sure its package definitions are up to date.
Then install `git`, which you will need for fetching your app code.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git
```

### Node

Debian's own `nodejs` package is too old for our app (Vite 8 and
`--env-file` need Node 20 or newer). Install it from NodeSource instead:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
sudo apt install -y nodejs
node -v
```

These commands grab the setup script from NodeSource and run it. The script updates the apt registry with
the selected Node version (v22 in this case). `sudo apt install -y nodejs` installs node in the OS, so it's
the one your app will use.

### MongoDB

Next, install MongoDB. These are the instructions from [Install MongoDB Community on Linux](https://www.mongodb.com/docs/manual/administration/install-community-linux/?linux-method=pkg&linux-distro=debian). If you're referring back to these instructions at some point in the future, check
the latest version--not these.

```bash
sudo apt-get install -y gnupg curl

curl -fsSL https://pgp.mongodb.com/server-9.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-9.gpg --dearmor

echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-9.gpg ] https://repo.mongodb.org/apt/debian trixie/mongodb-org/9.0 main" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-9.0.list

sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod
systemctl status mongod
```

:::details What this does
First, install `gnupg`, which deals with signing keys--this is needed for verifying the mongo download. It also installs `curl`,
but we already have that, so it's not strictly needed.

The next command grabs the signing key from mongo and installs it in the OS's keyrings for apt to read.

The third `echo` | `sudo tee` command tells apt where to get the mongo distribution.

The `sudo apt-get` commands are like the ones we saw before--update `apt-get` and then install mongo.

The last two `(sudo) systemctl` commands invoke Debian's *service* management system to install mongod as
a service and then check that it's running. This will enable it to run whenever the OS is running so it doesn't need to be started and stopped
manually. `systemctl` can also restart a service that crashes, if the service's file
asks it to (we'll do that for our app in Part 5).
:::

Note that we will leave Mongo running on its default IP and port, i.e., `127.0.0.1:27017`. This works because the app server will be running on the same machine, so Mongo is local from the server's perspective. We won't worry about securing Mongo within the machine since we will be working to make sure that the machine is secure as a whole--we don't need to worry about attacks from within.

### nginx and certbot

Install `nginx` and `certbot`, along with some python glue:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

`nginx` ("Engine-X") and `certbot` are two essential tools for a webapp deployment.

`nginx` is a web server that manages traffic between the wide open web and your app server. It lets browsers reach your app through the standard web ports for HTTP (80) and HTTPS (443). This way clients don't need to know about port 6790 or any such thing, they can just use the defaults. It also manages the encryption and decryption of HTTPS so your app doesn't even have to know about that. `nginx` does a lot of other stuff too but we're not going to get into all that.

`certbot` is a utility that gets the HTTPS certificate from Let’s Encrypt, a free certificate authority. A certificate is what lets a browser trust that it’s really talking to mwnewman.si679.net, and it’s what gives you the padlock icon in the browser. One of the things `certbot` does is prove to Let's Encrypt that you actually control the domain. Let's Encrypt expects to be able to fetch a known token from a specific URL at your domain (e.g., `http://mwnewman.si679.net/.well-known/acme-challenge/…`). `certbot` puts the token there that convinces Let's Encrypt to issue the certificate. `certbot` downloads it and installs it in `nginx`, and also renews it automatically before it expires (certificates last 90 days).

`python3-certbot-nginx` is a plugin that lets `certbot` talk to `nginx`.

Visit `http://<your IP>`: nginx's welcome page means the VM is reachable. (Note: *not* HTTPS and *not* the DNS entry... yet.)

## Part 4: Getting the app onto the VM

### Clone your repo

The repo you created when you accepted today's assignment is public (this week only!), so the VM can clone it without logging in to GitHub. On GitHub, copy your repo's HTTPS address (the green **Code** button),
then on the VM:

```bash
cd ~
git clone https://github.com/SI679-Classroom-F26/si-679-f-26-week09-nyt-<your GitHub username>.git
```

Push from your laptop as usual; the VM only ever pulls.

### Install and build

```bash
cd <your repo>
cd client && npm ci && npm run build
cd ../server && npm ci && npm run build
```

`npm ci` installs exactly what `package-lock.json` says. It's the usual choice
on servers.

The client needs **no** `.env` on the VM. Without `VITE_API_URL`, the built
client talks to whatever address it was loaded from, which is exactly what we want.

### The server's settings

`.env` never goes to GitHub, so the copy of your repo on the VM doesn't have
one. Make it from `.env.example`, just as you did on your laptop:

```bash
cd ~/<your repo>/server
cp .env.example .env
```

Only the server gets a `.env`. The client doesn't need one (see above).

Two values need changing. First, make **a new secret**. Don't reuse your
laptop's: anyone who knows the secret can make tokens your server will
accept.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy what it prints, then open the file:

```bash
nano .env
```

:::tip nano?
`nano` is a terminal-based text editor. It might seem scary the first time you see it, but it's less intimidating than its predecessors `vi` and `emacs`. Just don't make any sudden moves and you'll be OK.
:::

Change these two lines:

- `JWT_SECRET`: the string you just made, in quotes.
- `CLIENT_ORIGIN`: your app's address, `"https://<uniqname>.si679.net"`.
  The client and the API now share that address, so the browser won't
  actually check CORS, but the setting should still tell the truth.

Leave `PORT`, `MONGO_URI` and `DB_NAME` as they are. MongoDB runs on the VM
itself, just as it does on your laptop, and nginx will find the app on port
6790. Without the comments, your `.env` should look like this, with your own
secret and uniqname:

```ini
JWT_SECRET="3f9c…your own long string…"
CLIENT_ORIGIN="https://mwnewman.si679.net"
PORT=6790
MONGO_URI="mongodb://127.0.0.1:27017"
DB_NAME="week9"
```

To save in `nano`: **Ctrl-O** (for "Write Out"), then **Enter** (to save to the same file you opened). To quit: **Ctrl-X**.

### Seed and try it

```bash
npm run seed
npm start
```

In a second SSH window into the same VM: `curl http://localhost:6790/health`. Kill the first window and try hitting the same URL. The server is dead. Let's fix that next.

## Part 5: Keep it running with systemd

`systemd` starts programs when the VM boots and restarts them if they crash.
We already set up `mongod` to run this way. Our app needs a *service file*, which we will create. But to do this you'll need two pieces of information--your username and the path to your server.

First the path, which you can get by running `pwd` in your server directory. This is long, so copy it to your clipboard.

Your username is probably your uniqname if you're using your umich.edu account. You can (and should) check it with `whoami`. Don't copy to your clipboard, though, or you'll lose the path you just copied!

```bash
sudo nano /etc/systemd/system/maizebrew.service
```

This gives you a new, empty file. Fill it with this, replacing the things in `<xxx>` with the values you just captured:

```ini
[Unit]
Description=Maize & Brew
After=network.target mongod.service

[Service]
User=<your username>
WorkingDirectory=<path to your server dir>
ExecStart=/usr/bin/node --env-file=.env dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Now run the service--this will keep it running. `Restart=always` in the config file above makes systemd restart your
server if it crashes, and `RestartSec=5` makes it wait 5 seconds before doing so.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now maizebrew
systemctl status maizebrew
journalctl -u maizebrew -n 50
```

Note that the service name (`maizebrew`) comes from the service config file name (`maizebrew.service`) so make sure those match.

`journalctl` is how you read the console.logs from your service once it's running. Run it now and you should see the familiar startup message mixed in with output from `systemd`.

```text
$ journalctl -u maizebrew
Nov 17 05:37:37 week09-deployment systemd[1]: Started maizebrew.service - Maize & Brew.
Nov 17 05:37:38 week09-deployment node[11503]: Server running on port 6790

```

## Part 6: nginx in front

Give nginx a site file for your app.

```bash
sudo nano /etc/nginx/sites-available/maizebrew
```

Be sure to put your `<uniqname>` in the .si679.net URL.

```nginx
server {
    listen 80;
    server_name <uniqname>.si679.net;

    location / {
        proxy_pass http://127.0.0.1:6790;

        # Let socket.io's WebSocket connections through.
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Turn it on, turn off the welcome page (`sites-enabled/default`), check, and reload:

```bash
sudo ln -s /etc/nginx/sites-available/maizebrew /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Visit `http://<uniqname>.si679.net`, or `http://<your IP>` if your name doesn't
resolve yet (we'll check that properly in Part 7). With the welcome page gone,
nginx sends any request to your app.

::: info The WebSocket lines in the nginx file
A WebSocket starts as an HTTP request asking to be *upgraded*. nginx doesn't
pass that request along unless you tell it to. Without those three lines,
the app loads but live updates break, or socket.io quietly falls back to
long polling.
:::

## Part 7: HTTPS

First check that your name points at your VM:

```bash
nslookup <uniqname>.si679.net
```

This should start working a few minutes after you submit your uniqname/IP address via the Google form and we have had a chance to update the DNS records.

::: warning Don't run certbot until `nslookup` answers
Let's Encrypt locks a name out for an hour after 5 failed tries, and allows
only 50 certificates a week for all of si679.net. Run it once, when your DNS
is ready.
:::

When nslookup shows your IP, ask Let's Encrypt for a certificate:

```bash
sudo certbot --nginx -d <uniqname>.si679.net
```

You can skip entering your email but you can't skip accepting
the terms of service.

`certbot` proves you control the name, installs the certificate, adds HTTPS to
your nginx site file, and redirects `http://` to `https://`. It also renews the
certificate automatically before it expires.

::: tip Closing the loophole from week 6 (auth)
Try it: go to `http://<uniqname>.si679.net` (plain `http`), and you'll land on
`https://`. Back in [week 6](/weeks/week06-auth-rbac/week06-notes), when we
added `bcrypt`, we noted that we were sending passwords over plain HTTP, where
a "man in the middle" between the browser and the server could read them, and
that HTTPS would close that loophole. This redirect is what closes it. The
first request to `http://` is just "give me the page", with nothing secret in
it. The server answers with "go to `https://` instead", so the login form, and
every request the client makes after it, travel encrypted.
:::


Open `https://<uniqname>.si679.net` in two windows, a customer and staff, and
place an order. Or better yet, give your neighbor your URL and let them create an account and order some things that you fulfill for them. Then trade seats.

## Changing your app and shipping the changes

Now that you have your deployment set up, you can push changes by

1. Developing, testing, and running on your laptop until you're sure the change is ready.
2. Committing and pushing the changes from your laptop to GitHub. If you're working on a team, create a PR and wait for approval to merge.
3. Open an SSH window into your VM and pull the changes.
4. Build.
5. Re-deploy by restarting the service and check that it worked.

Practice this workflow by making a small, visible change to your client. Maybe change the colors of the text "Maize & Brew" so that they're, you know, Maize and Blue. Or do literally anything to make the app look better. Or worse. Just something that you can verify easily.

Do steps 1 & 2 on your laptop--testing to make sure the change is what you want before committing and pushing.

On the VM, steps 3 to 5 look like this:

```bash
cd ~/<your repo>
git pull
cd client && npm ci && npm run build
cd ../server && npm ci && npm run build
sudo systemctl restart maizebrew
systemctl status maizebrew
journalctl -u maizebrew -n 50
```

## What it costs, and cleaning up

As you saw, the cost for running this app in an e2-small VM would be about $17/month. If you stop the VM, you stop paying for the machine itself (about $12 of the $17), but you still pay for its disk and its static IP: about $5 a month. To save credits, stop the VM when you're not using it; when you're done with it for good, delete the VM *and* release the static IP. Don't skip the second part: a reserved IP that isn't attached to anything costs more than one that is (about $7 a month).

Alternatively, you can keep them around and use them for your final project. Also, you can request another subdomain for your final project like ourawesomeproject.si679.net and repeat the necessary steps in this document to get your app set up and running with that DNS name. This other subdomain can be pointed at the same IP or a new one, just let us know.

You can still save credits by turning the VM off when you're not actively using it and turning it back on when you're ready to test the live app, demo it, or release it into the wild.

## Things we didn't do

There are several things that you would typically see in industry deployments that you didn't see today.
We'll discuss them briefly for your awareness--if you're interested in developing your skills in this
area, these would be topics for you to look into.

**Containerization**: Rather than manually installing git, node, mongo, etc. on a VM through the command line, most teams nowadays would use a containerization strategy like Docker to pre-build a complete environment with exactly the right dependencies (a specific version of Node, MongoDB, etc.) to ensure that the app behaves in a predictable way no matter where it's deployed. Often containers will be used for both development and deployment to make sure there are no surprises at deployment time.

**CI/CD Pipelines**: Teams often set up Continuous Integration/Continuous Deployment pipelines to smooth the process of developing, testing, and deploying software. The "integration" piece refers to assembling different pieces of code into a coherent whole. Disciplined practices around using git branches, pull requests with reviews, and github actions for automated testing, linting, typechecking, etc. help make sure that different chunks of work (commits) work together and don't break anything. The "deployment" piece refers to automated ways to move code from development to production (often with other steps in between like "dev" and "staging" deployments) that don't involve manually logging into a remote server to pull code and restart services.

**Backups**: Things break. Servers get hacked. Data gets corrupted. Every team needs a strategy for making regular backups of code (git/github handles this for the most part, but you have to use it right) and data (weighing storage costs against backup frequency and volume), along with plans for restoring known-good app states in case disaster strikes.

**Logging**: We briefly looked at how to view console logs (`journalctl`) for services run with `systemctl`, but this has limitations. For example you need to log into the VM and run the command, which doesn't give you easy ways to search for specific events or navigate the logs. GCP and other cloud services have logging mechanisms built in that you can use for more manageable log analysis, but here also it all depends on how you use it. There are logging packages out there with passionate audiences who will be happy to tell on their Medium blogs how you should set up your logging infrastructure.

**Cloud DBs**: We installed our own MongoDB both locally and in our VM, but many apps don't use their own database infrastructure at all. A wide range of options exist here, ranging from MongoDB Atlas to Firebase Firestore to AWS DynamoDB to GCP's own CloudSQL. Depending on the use case, these can be more or less expensive than running your own DB 24/7, especially if used in conjunction with approaches that don't require your backend to be running all the time (using yet more tools like Cloud Functions/AWS Lambdas, Cloud schedulers, API Gateways, etc.).

**3rd Party Auth**: Rolling your own auth with `bcrypt` and `jwt`s is another example of "good enough for an MVP but not really good enough for production." This solution doesn't scale (out of the box, anyway) to handle many expected modern auth features such as MFA, password recovery, email/SMS verification, biometric auth, passkeys, etc. And these features change all the time, so trying to keep your app up to date with all of them is a losing game. There are lots of auth providers out there, from the open-source and potentially free self-managed toolkits (BetterAuth, Logto) to hosted, not-so-free services (Auth0, Firebase Auth, AWS Cognito). And if you're working within an organization, you might be mandated to use certain services and avoid others (e.g, for a deployment within U-M you've pretty much got to use U-M's SSO service, which is based on Okta). `bcrypt`/`jwt` is good to have in your toolbox and it does help you understand what's happening under the hood with these other services. Also the reasoning about route protection and role of middleware is likely very similar, it's just the specifics of how it's wired up that changes.

:::tip Announcements

- That was our last lecture!
- I will send out a poll to see what folks want to do with class meetings Nov 24 and Dec 1.
- Checkpoint #1 due FRIDAY
- HW4 due NEXT WEDNESDAY
- Checkpoint #2 due Monday Nov 30
- Demo & presentation day during class Dec 8 (details coming soon)
- Final repo push Friday Dec. 11
- Final IPAs Dec 14-16

:::

:::warning Move your deployments and/or repos BEFORE SI 679 closes up shop on 12/18

We will remove all `*.si679.net` DNS entries at some point after Jan. 1. If you want help moving your project deployment to another server (also moving your repo out of Classroom 50), please reach out BEFORE 12/18. I will not guarantee any kind of timely response to anything between 12/18 and early January, which might be too late.

:::

... and that's it!

If we're done early feel free to hang out, ask questions, work on final projects, etc. We can help you with your final project deployment plans if you'd like to use the approach we used today. You can do it another way if you like, but we'll be less able to support you if you get stuck!
