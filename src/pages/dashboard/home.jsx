import React from "react";
import UserData from "../../components/UserData";
import BooksView from "../../components/BooksView";


export function Home() {
  return (
    <div className="mt-12">
     <UserData />
     <BooksView/>
    </div>
  );
}

export default Home;
