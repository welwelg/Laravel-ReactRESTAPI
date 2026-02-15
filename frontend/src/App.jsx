import { useEffect, useState } from "react";
import { api } from "./api/axios";

function App() {
  //  STATE MANAGEMENT 
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [editingTask, setEditingTask] = useState(null); 

  //  FETCH DATA 
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks");
        setTasks(response.data.data); 
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  //  HANDLE SUBMIT (CREATE & UPDATE) 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editingTask) {
        //  UPDATE MODE
        const response = await api.put(`/tasks/${editingTask.id}`, {
          title: title,
          description: description,
          is_completed: editingTask.status === "Completed"
        });

        // Update UI: Find and replace the task
        setTasks(tasks.map(t => 
          t.id === editingTask.id ? response.data.data : t
        ));

        // Exit Edit Mode
        setEditingTask(null);

      } else {
        //  ADD MODE
        const response = await api.post("/tasks", {
          title: title,
          description: description
        });

        // Add to list
        setTasks(prevTasks => [response.data.data, ...prevTasks]);
      }

      // Cleanup
      setTitle("");
      setDescription("");
      
    } catch (error) {
        if (error.response && error.response.status === 422) {
            setErrors(error.response.data.errors);
        } else {
            console.error("Error saving task:", error);
            alert("Failed to save task.");
        }
    }
  }; 

  //  TOGGLE STATUS 
  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status !== "Completed";
      
      const response = await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        is_completed: newStatus 
      });

      setTasks(tasks.map(t =>
        t.id === task.id ? response.data.data : t
      ));
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task");
    }
  };

  //  DELETE TASK 
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this task?")) return; 
    
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };


  //  PREPARE EDIT 
  const handleEditClick = (task) => {
      setEditingTask(task); // Save the task being edited
      setTitle(task.title); // Fill the form with current data
      setDescription(task.description); 
      setErrors({}); 

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
    
  // CANCEL EDIT 
  const handleCancelEdit = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setErrors({});
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Task Manager</h1>

      {/*  FORM SECTION  */}
      <div style={{ marginBottom: "40px", padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
        <h3>{editingTask ? "Edit Task" : "Add New Task"}</h3>
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: "10px" }}>
            <input 
              type="text" 
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ padding: "10px", width: "100%", boxSizing: "border-box" }}
            />
            {errors.title && <p style={{ color: "red", fontSize: "12px", margin: "5px 0 0" }}>{errors.title[0]}</p>}
          </div>

          <div style={{ marginBottom: "10px" }}>
            <textarea 
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ padding: "10px", width: "100%", height: "80px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
                type="submit" 
                style={{ 
                    padding: "10px 20px", 
                    background: editingTask ? "#f0ad4e" : "blue", // Orange for Edit, Blue for Add
                    color: "white", 
                    border: "none", 
                    cursor: "pointer", 
                    borderRadius: "5px" 
                }}
            >
                {editingTask ? "Update Task" : "Add Task"}
            </button>

            {editingTask && (
                <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    style={{ padding: "10px 20px", background: "#ccc", color: "black", border: "none", cursor: "pointer", borderRadius: "5px" }}
                >
                    Cancel
                </button>
            )}
          </div>
        </form>
      </div>

      {/*  LIST SECTION  */}
      <div style={{ display: "grid", gap: "20px" }}>
        {tasks.map((task) => (
          <div 
            key={task.id} 
            style={{ 
              border: "1px solid #ccc", 
              padding: "20px", 
              borderRadius: "8px",
              backgroundColor: task.status === "Completed" ? "#efffef" : "#fff",
              opacity: task.status === "Completed" ? 0.7 : 1
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                    <h3 style={{ margin: "0 0 10px 0", textDecoration: task.status === "Completed" ? "line-through" : "none" }}>
                        {task.title}
                    </h3>
                    <p style={{ margin: 0, color: "#555" }}>{task.description}</p>
                    <small style={{ display: "block", marginTop: "10px", color: "#888" }}>
                        Status: <strong>{task.status}</strong>
                    </small>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    {/* EDIT BUTTON */}
                    <button 
                        onClick={() => handleEditClick(task)}
                        style={{
                            padding: "5px 10px",
                            cursor: "pointer",
                            background: "#0275d8", // Blue
                            color: "white",
                            border: "none",
                            borderRadius: "4px"
                        }}
                    >
                        Edit
                    </button>

                    {/* TOGGLE BUTTON */}
                    <button 
                        onClick={() => handleToggleStatus(task)}
                        style={{
                            padding: "5px 10px",
                            cursor: "pointer",
                            background: task.status === "Completed" ? "#f0ad4e" : "#5cb85c",
                            color: "white",
                            border: "none",
                            borderRadius: "4px"
                        }}
                    >
                        {task.status === "Completed" ? "Undo" : "Done"}
                    </button>

                    {/* DELETE BUTTON */}
                    <button 
                        onClick={() => handleDelete(task.id)}
                        style={{
                            padding: "5px 10px",
                            cursor: "pointer",
                            background: "#d9534f",
                            color: "white",
                            border: "none",
                            borderRadius: "4px"
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;