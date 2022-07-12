const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'H3rmesmink!',
    database: 'employee_db'

  }
);

const promptInit = () => {
  inquirer
    .prompt
    ([{
      type: 'list',
      name: 'answer',
      message: "Please select a function",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add department",
        "Add role",
        "Add employee",
        "Update employee role"
      ]
    }])
    .then((data) => {
      switch (data.answer) {
        case "View all departments":
          showDepartments();
          break;
        case "View all roles": 
          showRoles();
          break;
        case "View all employees":
          showEmployees();
          break;
        case "Add department":  
          promptNewDep();
          break;
        case "Add role":
          promptNewRole();
          break;
        case "Add employee":
          promptNewEmployee();
          break;
        case "Update employee role":
          updateEmployee();
          break;
      }
    })
    .catch((err) => console.error(err));
};


const promptNewDep = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: "Input the new department name",
      }
    ])
    .then((val) => {
      createDepartment(val.name)
    })
    .catch((err) => console.error(err));
};

const promptNewRole = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: "Input the new Role title",
      },
      {
        type: 'input',
        name: 'salary',
        message: "Input the new Role salary",
      },
      {
        type: 'list',
        name: 'dept',
        message: "Select which department this role is part of",
        choices: deptArray
      }
    ])
    .then((val) => {
      createRole(val.title, val.salary, val.dept);
    })
    .catch((err) => console.error(err));
};

const promptNewEmployee = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "Input the employee's first name",
      },
      {
        type: 'input',
        name: 'lastName',
        message: "Input the employees last name",
      },
      {
        type: 'list',
        name: 'role',
        message: "Select the role this employee will have",
        choices: roleArray
      },
      {
        type: 'list',
        name: 'manager',
        message: "Select the manager this employee will have",
        choices: managerArray
      }
    ])
    .then((val) => {
      createEmployee(val.firstName, val.lastName, val.role, val.manager);
    })
    .catch((err) => console.error(err));
};


function updateEmployee(){
    inquirer
    .prompt([
      {
        type: 'list',
        name: 'employee',
        message: "Select which employee to update",
        choices: employeeArray
      },
      {
        type: 'list',
        name: 'role',
        message: "Select a role to update for this employee",
        choices: roleArray
      }
    ])
    .then((val) => {
      modifyEmployee(val.employee, val.role);
    })
    .catch((err) => console.error(err));
};

function promptContinue() {
  inquirer.prompt(
    {
      type: 'list',
      name: 'answer',
      message: "Continue?",
      choices: ["yes", "no"]
    }
  )
    .then(val => {
      if (val.answer === "yes") {
        promptInit();
      } else {
        db.end();
      }
    });
}

const init = () => {
  promptInit();
}


function showDepartments() {
  console.log("Showing department table")
  db.promise().query('SELECT * FROM departments')
    .then(([rows, fields]) => {
      console.table(rows);
      promptContinue()
    })
    .catch(console.log)
    
    
}

function showRoles() {
  console.log("Showing roles table")
  db.promise().query('SELECT * FROM roles')
    .then(([rows, fields]) => {
      console.table(rows);
      promptContinue()
    })
    .catch(console.log)
}

function showEmployees() {
  console.log("Showing employees table")
  db.promise().query('SELECT * FROM employees')
    .then(([rows, fields]) => {
      console.table(rows);
      promptContinue()
    })
    .catch(console.log)
}

function createRole(roleName, roleSal, depName) {
  const name = roleName;
  const sal = roleSal;
  const dep = depName;

  db.promise().query(`SELECT id FROM departments where department_name = ?`, [dep])
    .then(([rows, fields]) => {
      db.query(`INSERT INTO roles (title,salary,department_id) VALUEs("${name}","${sal}","${rows[0].id}")`, function (err, results) {
      });
      showRoles();
    })
    .catch(console.log);
};

function createDepartment(name) {
  console.log(`Creating new Department`)
  db.query(`INSERT INTO departments (department_name) VALUES ('${name}')`, function (err, results) {
    console.log(`${name} added to Departments`);
    showDepartments();
  });
}

function createEmployee(firstName, lastName, defRole, defManager) {
  const fname = firstName;
  const lname = lastName;
  const role = defRole;
  const manager = defManager;
  let roleID;
  let manID;

  db.promise().query(`SELECT id FROM employees where CONCAT(first_name, ' ', last_name) = ?`, [manager])
    .then(([rows, fields]) => {
      manID = rows[0].id;
      db.promise().query(`SELECT id FROM roles where title = ?`, [role])
        .then(([rows, fields]) => {
          roleID = rows[0].id;
          db.query(`INSERT INTO employees (first_name,last_name,role_id,manager_id) VALUEs("${fname}","${lname}","${roleID}","${manID}")`, function (err, results) {
          });
          showEmployees();
        })
    })
    .catch(console.log);
}

function modifyEmployee(name, defRole) {
  let nameArray = name.split(/(\s+)/);
  const fname = nameArray[0];
  const lname = nameArray[2];
  const role = defRole;
  let roleID;

  db.promise().query(`SELECT id FROM employees where CONCAT(first_name, ' ', last_name) = ?`, [name])
    .then(([rows, fields]) => {
      empID = rows[0].id;
      db.promise().query(`SELECT id FROM roles where title = ?`, [role])
        .then(([rows, fields]) => {
          roleID = rows[0].id;
          db.query(`UPDATE employees SET first_name = "${fname}", last_name = "${lname}", role_id = "${roleID}" WHERE id = "${empID}"`, function (err, results) {
          });
          showEmployees();
        })
    })
    .catch(console.log);
}



function deptArray() {
  return new Promise(
    (resolve, reject) => {
      db.query("SELECT * FROM departments", (err, rows) => {
        if (err) {
          reject(err);
        }

        let rowArray = rows.map(({ id, department_name }) => ({ id: id, name: department_name }));
        resolve(rowArray);
      })
    }
  );
}

function employeeArray() {
  return new Promise(
    (resolve, reject) => {
      db.query("SELECT * FROM employees", (err, rows) => {
        if (err) {
          reject(err);
        }
        let rowArray = rows.map(({ id, first_name, last_name }) => ({ id: id, name: first_name + " " + last_name}));
        resolve(rowArray);
      })
    }
  );
}

function roleArray() {
  return new Promise(
    (resolve, reject) => {
      db.query("SELECT * FROM roles", (err, rows) => {
        if (err) {
          reject(err);
        }
        let rowArray = rows.map(({ id, title }) => ({ id: id, name: title }));
        resolve(rowArray);
      })
    }
  );
}


function managerArray() {
  return new Promise(
    (resolve, reject) => {
      db.query("SELECT * FROM employees WHERE role_id = 1", (err, rows) => {
        if (err) {
          reject(err);
        }
        let rowArray = rows.map(({ id, first_name, last_name }) => ({ id: id, name: first_name + " " + last_name }));
        resolve(rowArray);
      })
    }
  );
}


init();