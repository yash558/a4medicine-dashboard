import React, { useState, useEffect } from "react";
import API from "../API";
import toast, { Toaster } from "react-hot-toast";
import Loading from "./Loading";

const QuizView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const token = localStorage.getItem("token");
  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState("");
  const [embed, setEmbed] = useState("");
  const [id, setId] = useState(null);
  const [count, setCount] = useState(0);
  const [file, setFile] = useState(null);
  const [fileExt, setFileExtension] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editEmbed, setEditEmbed] = useState("");
  const [editCount, setEditCount] = useState(0);

  // function to get all data from api
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}quiz`);
        const dat = await response.json();
        //   console.log(dat.data.books);
        if (dat.status === "success") {
          setLoading(false);
          setData(dat?.data.quizes);
        } else {
          toast.error(dat.message);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        toast.error(error.message);
      }
    };
    getData();
  }, []);

  //  notification to confirm delete
  const handleQuizCancel = () => {
    setShowNotification(true);
  };

  const handleConfirm = () => {
    // Logic for handling confirm action
    handleDelete();
    setShowNotification(false);
  };

  const handleCancel = () => {
    // Logic for handling cancel action
    setShowNotification(false);
  };

  // function to delete a data
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API}quiz/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log(result);
      if (result.status === "success") {
        toast.success("Quiz deleted successfully!");
        setData((prevData) => prevData.filter((book) => book.id !== id));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the book.");
    }
  };

  const hideEditForm = () => {
    setEditFormVisible(false);
  };

  // function to create a new quiz
  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpload();

    const apiEndpoint = `${API}quiz`;

    fetch(apiEndpoint, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, image, embed, count }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data if needed
        console.log("Response:", data);
        if (data.status === "success") {
          toast.success("New Quiz Created!");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error);
      });

    // Hide the form popup after submitting
    setShowForm(false);
    // Clear the form fields after submission
    setName("");
    setImage("");
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setEditName(quiz.name);
    setEditImage(quiz.image);
    setEditEmbed(quiz.embed);
    setEditCount(quiz.count);
  };
  

  // function to edit a quiz
  const handleEditSubmit = () => {};

  // function to get a file name
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Get the file name (including the extension)
    const fileName = selectedFile.name;

    // Split the file name to extract the file extension
    const parts = fileName.split(".");
    const fileExtension = parts[parts.length - 1]; // Get the last part which is the file extension
    setFileExtension(fileExtension);
  };

  // get a image url from api
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      const urlResponse = await fetch(`${API}image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          folderName: "quizes",
          format: fileExt,
        }),
      });

      const urlData = await urlResponse.json();

      if (urlData.status === "success") {
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(urlData.message);
      }

      const url = urlData.data.signedUrl;
      const key = urlData.data.key;
      setImage(key);

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          toast.success("File uploaded successfully!");
          // Handle the successful upload
        }
      };

      xhr.onerror = function () {
        console.error("Error uploading file");
        toast.error("Error uploading file.");
        // Handle the error
      };

      xhr.send(file);
      // console.log(file);
    } catch (error) {
      console.error("Error fetching upload URL:", error);
      toast.error("An error occurred while fetching the upload URL.");
    }
  };

  return (
    <div>
      <Toaster />
      <div className="flex justify-between">
        <h1 className="text-4xl text-bold ">Quiz</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowForm(true)}
        >
          Create
        </button>
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25">
            <form
              className="bg-white p-8 rounded shadow-md w-96"
              onSubmit={handleSubmit}
            >
              <div className="flex items-end justify-end">
                <button onClick={() => setShowForm(false)}>X</button>
              </div>
              <label htmlFor="name" className="block mb-2 font-bold">
                Name:
              </label>
              <input
                type="text"
                id="name"
                className="w-full border border-gray-300 px-3 py-2 mb-4 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label htmlFor="name" className="block mb-2 font-bold">
                Embed Link:
              </label>
              <input
                type="text"
                id="name"
                className="w-full border border-gray-300 px-3 py-2 mb-4 rounded"
                value={embed}
                onChange={(e) => setEmbed(e.target.value)}
                required
              />

              <label htmlFor="imageLink" className="block mb-2 font-bold">
                Image:
              </label>
              <input
                type="file" // Use type="file" for image input
                id="image"
                className="w-full border border-gray-300 px-3 py-2 mb-4 rounded"
                onChange={handleFileChange} // Store the image data in the state
                accept="image/*" // Add accept attribute to allow only image files
                required
              />

              <label htmlFor="imageLink" className="block mb-2 font-bold">
                No of Questions:
              </label>
              <input
                type="integer"
                id="count"
                className="w-full border border-gray-300 px-3 py-2 mb-4 rounded"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
              />

              <input
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                value="Submit"
              />
            </form>
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-screen flex items-center justify-center">
          <Loading color="#000000" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8 mt-12">
          {data.map((item) => (
            <div
              className="flex items-center p-4 justify-between rounded-md flex-col bg-white shadow-md space-x-2 space-y-4"
              key={item.id}
            >
              <div>
                <img
                  src={`https://a4medicine-charts.s3.ap-southeast-2.amazonaws.com/${item.image}`}
                  alt={item.name}
                  className="w-56 h-56"
                />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                {/* <p className="text-gray-600">£ {item.price}</p> */}
              </div>
              <div className="ml-auto space-x-2">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setId(item.id);
                    handleQuizCancel();
                  }}
                  className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editFormVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Book</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block font-medium text-gray-700"
                >
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="price"
                  className="block font-medium text-gray-700"
                >
                  Price:
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={hideEditForm}
                  className="px-4 py-2 ml-4 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center">
        {showNotification && (
          <div className="bg-white border  top-0 fixed z-[1000] rounded-lg p-4 mt-4">
            <p className="text-gray-800 text-lg mb-2">
              Are you sure you want to cancel your plan?
            </p>
            <div className="flex justify-end">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                onClick={handleConfirm}
              >
                Confirm
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
