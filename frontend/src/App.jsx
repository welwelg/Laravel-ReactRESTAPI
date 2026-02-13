import { useEffect, useState } from "react";
import { api } from "./api/axios";

function App() {
  // Default value ay empty array [] habang nagloload pa
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({}); // Para sa validation errors

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks");
        // I-save ang data sa state (memory)
        setTasks(response.data.data); 
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchTasks();
  }, []);

  //Submit handler para sa form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //Ipdala sa Laravel backend gamit ang POST request
      const response = await api.post("/tasks", {
        title: title,
        description: description
      });

      //Pag success, i-add natin agad sa listahan (para di na mag-refresh)
      //Gumamit tayo ng "Previous State" technique para safe
      setTasks(prevTasks => [response.data.data, ...prevTasks]);

      //Linisin ang form
      setTitle("");
      setDescription("");
      setErrors({}); // Linisin ang errors kung meron
    } catch (error) {
      //handle validation errors
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error creating task:", error);
      }
    }
  }

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Task Manager</h1>

      {/* Form */}
      <div style={{ marginBottom: "40px", padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
        <h3>Add New Task</h3>
        <form onSubmit={handleSubmit}>
          
          {/* Title Input */}
          <div style={{ marginBottom: "10px" }}>
            <input 
              type="text" 
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ padding: "10px", width: "100%", boxSizing: "border-box" }}
            />
            {/* Show Error if exists */}
            {errors.title && <p style={{ color: "red", fontSize: "12px" }}>{errors.title[0]}</p>}
          </div>

          {/* Description Input */}
          <div style={{ marginBottom: "10px" }}>
            <textarea 
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ padding: "10px", width: "100%", height: "80px", boxSizing: "border-box" }}
            />
          </div>

          <button 
            type="submit" 
            style={{ padding: "10px 20px", background: "blue", color: "white", border: "none", cursor: "pointer" }}
          >
            Add Task
          </button>
        </form>
      </div>
      
      {/*  Loop through the tasks using .map() */}
      <div style={{ display: "grid", gap: "20px" }}>
        {tasks.map((task) => (
          <div 
            key={task.id} // Important: Unique ID for React tracking
            style={{ 
              border: "1px solid #ccc", 
              padding: "20px", 
              borderRadius: "8px",
              backgroundColor: task.status === "Completed" ? "#e6fffa" : "#fff"
            }}
          >
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <small>Status: <strong>{task.status}</strong></small>
          </div>
        ))}
      </div>

    </div>
  )
}

export default App
