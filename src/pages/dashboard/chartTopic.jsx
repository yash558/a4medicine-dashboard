import React, { useState, useEffect } from "react";

import toast, { Toaster } from "react-hot-toast";

import API from "./../../API";
import Loading from "./../../components/Loading";

const ChartTopic = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState("");
  const [id, setId] = useState(null);
  const [file, setFile] = useState(null);
  const [fileExt, setFileExtension] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const urlId = window.location.href.split("chart/")[1];
  const token = localStorage.getItem("token");
  const [section, setSection] = useState("");
  const [body, setBody] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editSection, setEditSection] = useState("");

  // function to get all data from api
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}chart/${urlId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dat = await response.json();
        const sortedData = [...dat?.data.section].sort((a, b) =>
          a.topic.localeCompare(b.topic)
        );

        //   console.log(dat.data.books);
        if (dat.status === "success") {
          setLoading(false);
          setData(sortedData);
          setTopic(dat.data.topic);
          // console.log(dat?.data.charts);
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
      const response = await fetch(`${API}section/${id}`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (file) {
        await handleUpload();
      }

      const apiUrl = `${API}section/${urlId}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, section, body, image }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok && data.status === "success") {
        toast.success("New Chart Topic Created!");
      } else {
        toast.error(
          data.message || "Error occurred while creating the chart topic."
        );
      }

      // Hide the form popup after submitting
      setShowForm(false);
      // Clear the form fields after submission

      setSection("");
      setBody("");
      setImage("");
      setFile(null);
      setFileExtension("");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
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
          folderName: "charts",
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

  // function to edit a chart topic
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleUpload();
      const apiUrl = `${API}section/${id}`;
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: editTopic,
          body: editBody,
          section: editSection,
          image: image,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast.success("Chart Topic data updated successfully!");
        // Update the data state with the edited values
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id
              ? {
                  ...item,
                  topic: editTopic,
                  body: editBody,
                  section: editSection,
                  image: image,
                }
              : item
          )
        );
        // Hide the edit form
        hideEditForm();
      } else {
        toast.error(
          data.message || "Error occurred while updating the chart data."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

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

  return (
    <div className="p-10">
      <Toaster />
      <div className="flex justify-between">
        <h1 className="text-4xl text-bold">{topic}</h1>
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
                Topic:
              </label>
              <input
                type="text"
                id="name"
                className="w-full border border-gray-300 px-3 py-2 mb-4 rounded"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
              <label htmlFor="name" className="block mb-2 font-bold">
                Section:
              </label>
              <input
                type="text"
                id="section"
                className="w-full border border-gray-300 px-3 py-2 mb-4 rounded"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                required
              />
              <label htmlFor="name" className="block mb-2 font-bold">
                Body:
              </label>
              <input
                type="text"
                id="body"
                className="w-full border border-gray-300 px-3 py-2 mb-4 rounded"
                value={body}
                onChange={(e) => setBody(e.target.value)}
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
                <h2 className="text-lg font-semibold">{item.section}</h2>
                {/* <p className="text-gray-600">£ {item.price}</p> */}
              </div>
              <div className="ml-auto space-x-2">
                <button
                  onClick={() => {
                    setEditFormVisible(true);
                    setId(item.id);
                  }}
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
            <h2 className="text-lg font-semibold mb-4">Edit Chart Topic</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block font-medium text-gray-700"
                >
                  Topic:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={topic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="section"
                  className="block font-medium text-gray-700"
                >
                  Section:
                </label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  value={editSection}
                  onChange={(e) => setEditSection(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="body"
                  className="block font-medium text-gray-700"
                >
                  Body:
                </label>
                <input
                  type="text"
                  id="body"
                  name="body"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="mb-4">
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
              </div>
              <div className="flex justify-end">
                <input
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  value="Submit"
                />
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

export default ChartTopic;
