current REACT_APP_CONTRACT_ADDRESS: 0x9C56102224ce901707935f5f682870d9c59C9775
main admin key: 0x39f73d485fa916d519ea3f531745a44d8cc7ce951a1829967ab65ce2d8342c1d
current configuration: multi-admin

when using this need to use command prompt
powershell wont work becasue of security restrictions

use npm start in the frontend folder to run the project.
the .env file is used to simulate the user. but cannot see live after editing,
need to restart using npm start.

this project is done using truffle for the smart contract.
javaScript is used for compiling the system page and backend server.
all information is stored within truffle blockchain. depending on which configuration is used for the 
smart contract, only the main admin can assign roles to other users. this can be changed using the multi admin configuration
see above for which configuration is being used. 

before starting, users will need to install node.js in both front and back end folders
cd into both folders and use "npm install" to download all neccessary packages and modlues. 

for first users:
to start the system, you will need to first have truffle installed. (https://archive.trufflesuite.com/ganache/) you may choose to install either the GUI or CLI version of truffle,
but for this project, the GUI version was used. 
before starting anything, remember to modify the .env files located in both frontend and backend folders(if not found, you will need to create your own).
-backend: you will need to use mailtrap (https://mailtrap.io) to set up the environment. you can use your own email or a temporary email as the recepient.
  your file should look somehting like this:
    SMTP_HOST=smtp.mailtrap.io(may differ)
    SMTP_PORT=2525
    SMTP_USER=your_mailtrap_username
    SMTP_PASS=your_mailtrap_password
- frontend: this file will be used to set up the React App. 
  your file here should look like this:
    REACT_APP_RPC_URL=http://127.0.0.1:7545
    REACT_APP_PRIVATE_KEY=<private key of main admin>
    REACT_APP_CONTRACT_ADDRESS=<the deployed contract address>

after installing truffle, open a new project with quickstart. Get the private key of the first account and paste it into the frontend .env file's
REACT_APP_PRIVATE_KEY.
after thats done, open command prompt in this folder.
use the following commands:
  truffle compile
  truffle migrate --reset 
after this, you should have gotten a new contract address, paste it in the frontend .env file's REACT_APP_CONTRACT_ADDRESS.
lastly, use npm start in both frontend and backend folders to start both the backend server and the React App. 



some addiitonal notes:
1. this project is only workable in a controlled environment.   
    - no metamask or live email sending
*lacking multi signature authenication??
2. this project allows all users with the admin role to edit other user's roles, which may contradict the multi-sig authentication scheme.
  To address this this project has included a different mode to allow only the main admin(contract creator) to modify or add new roles to the system,
  whereas the sub-admins may only view tother user roles.*
    - to change this, go to the contract file(Auth.sol) and change the parameters for admin.
    - use the following codes in command prompt to recompile the system
        1 - truffle compile
          - truffle migrate --reset --network development
        2 - get the new network address and paste it in the 
            frontend .env file at REACT_APP_CONTRACT_ADDRESS
          - paste it here as well for own reference.
          - remember to save the files.
        3 - restart the system using npm start

*The use of one main admin does not make this project multi-sig. it only acts as a representation of it.
  ex: a team will need to come to a decision and then notify the main admin to make the change. 
