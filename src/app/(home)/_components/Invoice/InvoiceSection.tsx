'use client';

import { useState } from "react";
import Quotation from './Quotation';
import Invoice from './Invoice';
const InvoiceSection = () => {
  const [tab, setTab] = useState(1);
  return (
    <section>
      <div className="grid place-items-center">
        <div className="flex gap-3 ">
          <button onClick={() => setTab(1)} className={`p-3 px-20  ${tab == 1 ? 'bg-indigo-600 text-white' : 'bg-white text-black' }  font-bold rounded-lg shadow-7`}>Quotations</button>
          <button onClick={() => setTab(2)} className={`p-3 px-20  ${tab == 2 ? 'bg-indigo-600 text-white' : 'bg-white text-black' }  font-bold rounded-lg shadow-7`}>Invoices</button>
        </div>
      </div>

      {tab == 1 ?
    <Quotation /> :
    <Invoice /> 
    }


    </section>
  )
}

export default InvoiceSection