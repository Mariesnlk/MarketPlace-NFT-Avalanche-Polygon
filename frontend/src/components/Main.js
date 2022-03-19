import React from 'react';
import '../styles/App.css';

function Main() {
  return (
    <div className='container flex flex-wrap justify-center mb-12 mt-6 ml-12 mr-12'>
      <div className='container flex flex-wrap justify-center items-center mx-auto '>
        <div className="max-w-full max-h-full rounded overflow-hidden shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className='font-semibold text-5xl tracking-tight mr-12 mt-12 ml-12'>KRYPTOPAINTZ MARKETPLACE </span>
              <span className='font-normal text-3xl tracking-tight mr-12 mt-12 ml-12'>place
                to mint, buy, and sell extraordinary NFTs</span>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <div className="w-1/2 flex flex-col pb-12 shadow-2xl">
                  <span className='font-normal text-3xl text-center tracking-tight mr-12  ml-12'>REGISTRATION</span>
                  <input
                    placeholder="Username"
                    className="mt-2 mr-6 ml-6 border rounded p-4"
                  // onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                  />
                  <textarea
                    placeholder="Bio Description"
                    className="mt-2 mr-6 ml-6 border rounded p-4"
                  // onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                  />
                  <input
                    placeholder="Password"
                    className="mt-2 mr-6 ml-6 border rounded p-4"
                  // onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                  />
                  <button className="font-bold mt-4 mr-6 ml-6 bg-blue-500 text-white rounded p-4 shadow-lg">
                    Register
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </div>
  );
}

export default Main;
