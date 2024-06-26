import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import API from "./../../API";
import Loading from "./../../components/Loading";
import JoditEditor from "jodit-react";
import { Sidenav } from "./../../widgets/layout/sidenav";
import routes from "../../routes";
import {  useNavigate } from "react-router-dom";

const Charts = ({ placeholder }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editFormVisible, setEditFormVisible] = useState(false);
  const token = localStorage.getItem("token");
  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState("");
  const [id, setId] = useState(null);
  const [file, setFile] = useState(null);
  const [fileExt, setFileExtension] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const urlId = window.location.href.split("chart/")[1];
  const [title, setTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [section, setSection] = useState("");
  const [editTopic, setEditTopic] = useState("");

  const [editSection, setEditSection] = useState("");
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [editContent, setEditContent] = useState("");

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

        if (dat.status === "success") {
          setLoading(false);
          setData(sortedData);
          console.log(sortedData)
          setTitle(dat?.data?.topic);
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
  const getBodyData = async () => {
  
    try {
      const response = await fetch(`${API}section/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dat = await response.json();

      if (dat.status === "success") {
        setEditContent(dat?.data.body);
        console.log(dat?.data.body);
        setLoading(false);
      } else {
        toast.error(dat.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };
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
        toast.success("Chart deleted successfully!");
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
      let key;
      key = await handleUpload();
      console.log("moving to update in DB...");
      console.log(image);
      const apiUrl = `${API}section/${urlId}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: title,
          image: key,
          body: content,
          isOld: false,
          section: section,
        }),
      });

      const data = await response.json();
      // console.log("Response:", data);

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
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // function to get a file name
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const file = e.target.files[0]; // Get the selected file

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setSelectedImage(e.target.result); // Set the selected image data as a base64 URL
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    }

    // Get the file name (including the extension)
    const fileName = selectedFile.name;

    // Split the file name to extract the file extension
    const parts = fileName.split(".");
    const fileExtension = parts[parts.length - 1]; // Get the last part which is the file extension
    setFileExtension(fileExtension);
  };

  // console.log(url)

  // function to edit a chart
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let key;
      // If the file is selected for upload, upload the image and get the URL
      if (file) {
        key = await handleUpload();
        console.log("moving to update in DB...");
      }
      const apiUrl = `${API}section/${id}`;
      const newBody = {};

      console.log("image", key);

      if (editTopic !== "") {
        newBody.topic = title;
      }
      if (key !== "") {
        newBody.image = key;
      }
      if (editSection !== "") {
        newBody.section = editSection;
      }
      if (editContent !== "") {
        newBody.body = editContent;
      }

      console.log(newBody);
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify(newBody),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast.success("Chart data updated successfully!");
        // Update the data state with the edited values
        setData((prevData) =>
          prevData.map((item) => (item.id === id ? { ...item, newBody } : item))
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

  const uploadFile = async (url, file) => {
    console.log("File uploading...");
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (response.status === 200) {
        return "File uploaded successfully!";
      } else {
        throw new Error("Error uploading file");
      }
    } catch (error) {
      throw new Error("Error uploading file");
    }
  };

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
        return;
      }

      const url = urlData.data.signedUrl;
      const key = urlData.data.key;
      console.log("key in handle upload", key);
      setImage(key);

      console.log("Uploading file started...");
      const uploadResponse = await uploadFile(url, file);
      console.log("File uploaded successfully!");
      toast.success(uploadResponse);
      console.log("finished hande upload fn");
      return key;
      // Handle the successful upload
    } catch (error) {
      console.error("Error fetching upload URL:", error);
      toast.error("An error occurred while fetching the upload URL.");
    }
  };

  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // This function navigates back to the previous page
  };

  return (
    <>
      <Sidenav routes={routes} brandName="A4Medicine" />
      <div className="p-10 md:ml-80">
        <Toaster />
        <div className="flex justify-between">
          <button
            onClick={goBack}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
          <h1 className="text-4xl text-bold text-center">{title}</h1>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShowForm(true)}
          >
            Create
          </button>
          {showForm && (
            <div className="fixed inset-0 flex items-center justify-center overflow-y-auto md:pl-80   bg-black bg-opacity-25">
              <form
                className="bg-white p-8 rounded shadow-md max-w-7xl "
                onSubmit={handleSubmit}
              >
                <div className=" flex items-end justify-end">
                  <button onClick={() => setShowForm(false)}>X</button>
                </div>
                <label htmlFor="name" className="block mb-2 font-bold">
                  Topic:
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={title}
                  default
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-300"
                />
                <label htmlFor="name" className="block mt-4 mb-2 font-bold">
                  Section:
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full border border-gray-300 px-3 py-2 mb-4 rounded"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                />
                <div className="">
                  <label htmlFor="name" className="block mb-2 font-bold">
                    Body:
                  </label>
                  <JoditEditor
                    ref={editor}
                    value={content}
                    height="300px"
                    tabIndex={1} // tabIndex of textarea
                    onChange={(newContent) => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                  />
                </div>

                <label
                  htmlFor="imageLink"
                  className="block mt-4  mb-2 font-bold"
                >
                  Image:
                </label>
                <input
                  type="file" // Use type="file" for image input
                  id="image"
                  className="w-full border border-gray-300 px-3 py-2 mb-4 rounded"
                  onChange={handleFileChange} // Store the image data in the state
                  accept="image/*" // Add accept attribute to allow only image files
                  
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
            {data
              .slice() // Create a shallow copy of the data array
              .sort((a, b) => a.section.localeCompare(b.section)) // Sort the copy alphabetically by the 'topic' property
              .map((item, index) => (
                <div
                  className=" flex items-center p-4 justify-between rounded-md flex-col bg-white shadow-md space-x-2 space-y-4" // Added 'relative' class
                  key={item.id}
                >
                  <div className="bg-blue-500 text-white p-2 rounded-tr-md rounded-bl-md">
                    {index + 1} {/* Display card number */}
                  </div>
                  <div>
                    {item.image &&
                    <img
                      src={`https://a4medicine-charts.s3.ap-southeast-2.amazonaws.com/${item.image}`}
                      alt={item.name}
                      className="w-56 h-56"
                    />
                  }
                  </div>
                  <div className="text-center">
                    <h2 className="text-lg font-semibold">{item.section}</h2>
                  </div>
                  <div className="ml-auto space-x-2">
                    <button
                      onClick={() => {                     
                        getBodyData()                   
                        setId(item.id);
                        setSelectedImage(`https://a4medicine-charts.s3.ap-southeast-2.amazonaws.com/${item.image}`);
                        setEditSection(item.section);    
                        setEditFormVisible(true);
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
          <div className="fixed inset-0 flex items-center  justify-center bg-black bg-opacity-75">
            <div className="bg-white p-8 rounded-lg overflow-y-auto h-[90vh] shadow-lg md:ml-80">
              <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold mb-4">Edit Charts</h2>
              <div className="">
                  <button onClick={() => setEditFormVisible(false)}>X</button>
                </div>
                </div>
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
                    id="topic"
                    name="topic"
                    value={title}
                    default
                    className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-2 font-bold">
                    Section:
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full border border-gray-300 px-3 py-2 mb-4 rounded"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-2 font-bold">
                    Body:
                  </label>
                  <JoditEditor
                    ref={editor}
                    value={editContent}
                    tabIndex={1} // tabIndex of textarea
                    onChange={(newContent) => setEditContent(newContent)} // preferred to use only this option to update the content for performance reasons
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
                  />
                </div>
                {selectedImage && (
                  <div className="flex items-center justify-center flex-col my-2">
                    <p>Selected Image:</p>
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="max-w-xs max-h-[300px]"
                    />
                  </div>
                )}

                <div className="flex justify-center">
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
    </>
  );
};

export default Charts;
