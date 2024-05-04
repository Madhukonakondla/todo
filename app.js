const express = require("express");

const path = require("path");

const {open} = require("sqlite");

const sqlite3 = require("sqlite3");
const format = require("date-fns/format");

const isMath = require("date-fns/isMath");

var isValid = require("date-fns/isValid");
const app = express();

app.use(express.json());

let database;

const initializeDBandServer = async () => {
    try {
        database = await open({
            filename: path.join(__dirname, "todoApplication.db"),
            driver:sqlite3.Database,
        });

        app.listen(3000, () => {
            console.log("Server is running on http://localhost:3000/")
        });
    } catch (error) {
        console.log(`DataBase error is ${error.message}`);
        process.exit(1);
    }
};

initializeDBandServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
        requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
};

const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
};

const hasCategoryAndStatus = (requestQuery) => {
    return (
        requestQuery.category !== undefined && requestQuery.status !== undefined
    );
};

const hasCategoryAndPriority = (requestQuery) => {
    return (
        requestQuery.category !== undefined && requestQuery.priority !== undefined 
    );
};

const hasSearchProperty = (requestQuery) => {
    return requestQuery.search_q !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
    return requestQuery.category !== undefined;
};

const outPutResult = (dbObject) => {
    return {
        id: dbObject.id,
        
        todo: dbObject.todo,

        pripority: dbObject.priority,
        category: dbObject.category,

        status: dbObject.status,

        dueDate: dbObject.due_date,
    };
};

app.get("/todo/", async (request, response) => {
    let data = null;

    let getTodoQuery = "";

    const {search_q = "", priority, status, category} = request.query;

    switch (true) {
        case hasPriorityAndStatusProperties(request.query):
        if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
            if (
                status === "TO DO ||
                status === "IN PROGRESS" || 
                status === "DONE"
            ) {
                getTodoQuery = `
                
                SELECT * FROM WHERE status = '${status}' AND priority = '${priority}';`;
                data = await database.all(getTodoQuery);
                response.send(data.map((eachItem) => outPutResult(eachItem))); 
            } else {
                response.status(400);
                response.send("Invalid Todo Status");
            }
        } else {
            response.status(400);

            response.send("Invalid Todo Priority");
        }

        break; 

        case hasCategoryAndStatus(request.query):
        if (
            category === "WORK" || 
            category === "HOME" || 
            category === "LEARNING" 
        ) {
            if (
                status === "To Do" || 
                status === "IN PROGRESS" || 
                status === "DONE" 
            ) {
                getTodoQuery = `select * from todo where category='${category}' and status='${status}';`;
                data = await database.all(getTodoQuery);
                response.send(data.map((eachItem) => outPutResult(eachItem)));
            } else {
                response.status(400);
                response.send("Invalid Todo Status");
            }
        } else {
            response.status(400);
            response.send("Invalid Todo Category");
        }

        break;

        case hasCategoryAndPriority(request.query):
        if (
            category === "WORK" ||
            category === "HOME" ||
            category === "LEARNING"
        ) {
            if (
                priority === "HIGH" || 
                priority === "MEDIUM" || 
                priority === "LOW" 
            ) {
                getTodoQuery = ` select * from todo where category='${category}' and priority='${priority}';`;
                data = await database.all(getTodoQuery);
                response.send(data.map((eachItem) => outPutResult(eachItem)));
            } else {
                response.status(400);
                response.send("Invalid Todo Priority");
            }
        } else {
            response.status(400);
            response.send("Invalid Todo Category");
        }

        break; 

        case hasPriorityProperty(request.query):
        if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
            getTodoQuery = `
            
            SELECT * FROM todo WHERE priority ='${priority}';`;

            data = await database.all(getTodoQuery);
            response.send(data.map((eachItem) => outPutResult(eachItem)));
        } else {
            response.status(400);

            response.send("Invalid Todo Priority");
        }

        break;

        case hasStatusProperty(request.query):
        if (status === "To Do" || status === "IN PROGRESS" || status === "DONE"){
            getTodosQuery = `SELECT * FROM status = '${status}';`;

            data = await database.all(getTodoQuery);
            response.send(data.map((eachItem) => outPutResult(eachItem)));
        } else {
            response.status(400);
            response.send("Invalid Todo Status");
        }
        break;

        //has only search property

        //scenario 4 

        case hasSearchProperty(request.query):
        getTodoQuery = ` select * from toto where todo like '%{search_q}%';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((eachItem) => outPutResult(eachItem)));

        break;

        case hasCategoryProperty(request.query):
        if (
            category === "WORK" || 
            category === "HOME" ||
            category === "LEARNING"
        ) {
            getTodoQuery = `select * from todo where category='${category}';`;
            data = await database.all(getTodoQuery);
            response.send(data.map((eachItem) => outPutResult(eachItem)));
        } else {
            response.status(400);
            response.send("Invalid Todo Category");
        }
        break;

        default:
        getTodoQuery = `select * from todo;`;

        data = await database.all(getTodosQuery);
        response.send(data.map((eachItem) => outPutResult(eachItem)));
    }
});

app.get("/todos/:todoId/", async (request, response) => {
    const { todoId } = request.params;

    const getTodoQuery = `select * from todo where id=${todoId};`;

    const responseResult = await database.get(getTodoQuery);

    response.send(outPutResult(responseResult));
    });

    app.get("/agenda/", async (request, response) => {
        const { data } = request.query;
        console.log(isMatch(data, "yyy-MM-dd"));

        if (isMatch(date, "yyy-MM-dd")) {
            const newDate = formate(new Date(date), "yyy-MM-dd");

            console.log(newDate);

            const requestQuery = `select * from todo where due_date='${newDate}';`;

            const responseResult = await database.all(requestQuery);
            //console.log(responseResult);
            response.send(responseResult.map((eachItem) => outPutResult(eachItem)));
        } else {
            response.status(400);
            response.send("Invalid Due Data");
        }
    });

    app.post("/todos/", async (request, response) => {
        const {id, todo, priority, status, category, dueDate } = request.body;
        if(priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
            IF (status === "To Do" || status === "IN PROGRESS" || status === "DONE") {
                if (
                    category === "WORK" || 
                    category === "HOME" || 
                    category === "LEARNING" 
                ) {
                    if (isMatch(dueDate, "yyy-MM-dd")) {
                        const postNewDueDate = format(new Date(dueDate), "yyy-MM-dd");
                        const postTodoQuery = `
                        
                        INSERT INTO 
                        
                        todo (id, todo, category, priority, status, due_date)
                        VALUES 
                        
                        (${id}, '${todo}', '${category}', '${priority}', '${status}', '${status}', '${postNewDueDate}');`;

                        await database.run(postTodoQuery);
                        //console.log(responseResult);

                        response.send("Todo Successfully Added");
                    } else {
                        response.status(400);
                        response.send("Invalid Due Date");
                    }
                } else  {
                    response.status(400);

                    response.send("Invalid Todo Category");
                }
            } else {
                response.status(400);
                response.send("Invalid Todo Status");
            }
        } else {
            response.status(400);
            response.send("invalid Todo Priority");
        }
    });

    app.put("/todos/:todoId/", async (request, response) => {
        const { todoId } = request.params;

        let updateColumn = "";

        const requestBody = request.body;

        console.log(requestBody);

        const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
        const previousTodo = await database.get(previousTodoQuery);

        const {
            todo = previousTodo.todo,
            priority = previousTodo.priority,
            status = previousTodo.status,
            category = previousTodo.category,
            dueDate = previousTodo.dueDate,
        } = request.body;

        let updateTodoQuery;
        switch (true) {
            case requestBody.status !== undefined:
            if (status === "Todo"|| status === "IN PROGRESS" || status === "DONE") {
                updateTodoQuery = `
                
                UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
                due_date='${dueDate}' WHERE id = ${todoId};`;

                await database.run(updateTodoQuery);
                response.send(`Status Upadted`);
            } else {
                response.status(400);
                response.send("Invalid Todo Status");
            }

            break;

            //update priority 

            case requestBody.priority !== undefined:
            if (priority === "HIGH" || priority ==="LOW" || priority === "MEDIUM") {
                updateTodoQuery = `
                
                UPDATED todo SET todo='${todo}', priority='${priority}', status='{status}', category='${category}',
                due_date='${dueDate}' WHERE id = ${todoId};`;
                await database.run(updatedTodQuery);
                response.send("Invalid Todo Priority");
            } else {
                response.status(400);
                response.end("Invalid Todo Priority");
            }
            break;

            case requestBody.todo !== undefined:
            updateTodoQuery = `
            
            UPDATED todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
            due_date='${dueDate}' WHERE id = ${todoId};`;

            await database.run(updateTodoQuery);
            response.send(`Todo Updated`);
            break;

            // update category 

            case requestBody.category === undefined:
            if (
                category === "WORK" || 
                category === "HOME" || 
                category === "LEARNING" || 
                ) {
                updateTodoQuery = `
                
                UPDATED todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
                due_date='${dueDate}' WHERE id = ${todoId};`;

                await database.run(updatedTodoQuery);
                response.send("Category Updated");
            } else {
                response.status(400);

                response.send("Invalid Todo Category");
            }

            break;

            //updated due date 
            case requestBody.dueDate !== undefined:
            if (isMatch(dueDate, "yyy-MM-dd")) {
                const newDueDate = format(new Date(dueDate), "yyy-MM-dd");

                updateTodoQuery = `
                
                UPDATED todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
                due_date='${newDueDate}' WHERE id = ${todoId};`;
                await database.run(updateTodoQuery);
                response.send("Due Date Updated");
            } else {
                response.status(400);

                response.send("Invalid Due Date");
            }

            break;
        }
    });

    app.delete("/todos/:todoid/", async (request, response) => {
        const { todo } = request.params;

        const deleteTodoQuery = `
        DELETE
        FROM
        
        todo 
        
        WHERE 
        
        id=${todoId};`;

        await database.run(deleteTodoQuery);
        response.send("Todo Deleted");
    });

    module.exports = app;