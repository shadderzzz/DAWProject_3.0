To set up the application, follow the following steps

Open the virtual machine and clone the repo from github with 'git clone https://github.com/shadderzzz/DAWProject_3.0.git'

Then navigate into the folder with 'cd DAWProject_3.0'

Then do "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -" and "sudo apt install -y nodejs" right after, this ensures Node.js and npm are installed.

Then install all imports SEPERATELY that you have made in the application. 'npm install bcryptjs, axios, express-sanitizer, express-validator, express-session, mysql2, nodejs, request, stack, express'

You can either do this or run 'npm init' which should also download all the dependencies but just incase, follow the step above

After this, run 'sudo mysql' and log in

Aftr logging in, run 'source create_db.sql' and run 'exit'. This will import the script from the create_db.sql file and will set up the database for you 

After all these steps, you should be ready to run the application, run 'node index.js' or go to my virtual server 'https://www.doc.gold.ac.uk/usr/689/'
