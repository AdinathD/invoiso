import React from 'react';
import { Trash2, Edit, Save } from 'lucide-react';

export interface TableItem {
  srNo: number;
  id: string;
  name: string;
  hsn: string;
  quantity: number;
  uom: string;
  price: number; // Price with GST
  netWt: number;
  netRate: number;
  rate: number;
  gstPercent: number;
  net: number;
}

interface ProductListTableProps {
  items: TableItem[];
  setItems: React.Dispatch<React.SetStateAction<TableItem[]>>;
  editingSrNo: number | null;
  setEditingSrNo: (srNo: number | null) => void;
  handleDeleteItem: (srNo: number) => void;
  darkMode?: boolean;
}

export const ProductListTable: React.FC<ProductListTableProps> = ({
  items,
  setItems,
  editingSrNo,
  setEditingSrNo,
  handleDeleteItem,
  darkMode,
}) => {

  // -----------------------------
  // UPDATE ITEM FIELD (UNIFIED FUNCTION)
  // -----------------------------
  const updateItem = (
    srNo: number,
    field: keyof TableItem,
    value: string | number
  ) => {
    const updatedItems = items.map((item) => {
      if (item.srNo !== srNo) return item;

      const updatedItem = {
        ...item,
        [field]: value,
      };

      // Recalculate derived values
      const rate =
        updatedItem.price / (1 + updatedItem.gstPercent / 100);

      return {
        ...updatedItem,
        rate,
        netRate: rate,
        net: updatedItem.quantity * updatedItem.price,
      };
    });

    setItems(updatedItems);
  };

  return (
    <div
      className={`overflow-x-auto border rounded mb-2 transition-colors duration-150 ${
        darkMode
          ? 'border-gray-700 bg-gray-900'
          : 'border-gray-300 bg-white'
      }`}
    >
      <table className="w-full border-collapse text-left">
        <thead>
          <tr
            className={`font-bold text-[10.5px] border-b ${
              darkMode
                ? 'bg-gray-800 text-gray-350 border-gray-700'
                : 'bg-gray-150 text-gray-900 border-gray-300'
            }`}
          >
            <th className="w-[35px] text-center p-1 border-r border-gray-255 dark:border-gray-700">
              Sr.
            </th>
            <th className="w-[30%] p-1 border-r border-gray-255 dark:border-gray-700">
              Product Name
            </th>
            <th className="p-1 border-r border-gray-255 dark:border-gray-700">
              HSN
            </th>
            <th className="text-right p-1 border-r border-gray-255 dark:border-gray-700">
              Quantity
            </th>
            <th className="text-center p-1 border-r border-gray-255 dark:border-gray-700">
              UOM
            </th>
            <th className="text-right p-1 border-r border-gray-255 dark:border-gray-700">
              Price (with GST)
            </th>
            <th className="text-right p-1 border-r border-gray-255 dark:border-gray-700">
              Net Wt.
            </th>
            <th className="text-right p-1 border-r border-gray-255 dark:border-gray-700">
              Net Rate
            </th>
            <th className="text-right p-1 border-r border-gray-255 dark:border-gray-700">
              Rate
            </th>
            <th className="text-right p-1 border-r border-gray-255 dark:border-gray-700">
              GST %
            </th>
            <th className="text-right p-1 border-r border-gray-255 dark:border-gray-700">
              Net (Total)
            </th>
            <th className="w-[60px] text-center p-1">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isEditing = editingSrNo === item.srNo;
            return (
              <tr
                key={item.srNo}
                className={`border-b text-[11px] font-medium transition-colors duration-150 ${
                  darkMode
                    ? 'hover:bg-gray-800/50 border-gray-700 text-gray-200'
                    : 'hover:bg-gray-50 border-gray-300 text-gray-955'
                }`}
              >
                {/* SR NO */}
                <td className="w-[35px] text-center p-1 border-r border-gray-200 dark:border-gray-700">
                  {item.srNo}
                </td>

                {/* PRODUCT NAME */}
                <td className="p-1 border-r border-gray-200 dark:border-gray-700">
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-5 w-full focus:outline-none"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.srNo, 'name', e.target.value)
                      }
                    />
                  ) : (
                    <span className="font-medium">{item.name}</span>
                  )}
                </td>

                {/* HSN */}
                <td className="p-1 border-r border-gray-200 dark:border-gray-700">
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-5 w-full focus:outline-none"
                      value={item.hsn}
                      onChange={(e) =>
                        updateItem(item.srNo, 'hsn', e.target.value)
                      }
                    />
                  ) : (
                    <span>{item.hsn}</span>
                  )}
                </td>

                {/* QUANTITY */}
                <td className="text-right p-1 border-r border-gray-200 dark:border-gray-700">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-5 w-full focus:outline-none text-right"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.srNo,
                          'quantity',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  ) : (
                    <span>{item.quantity.toFixed(2)}</span>
                  )}
                </td>

                {/* UOM */}
                <td className="text-center p-1 border-r border-gray-200 dark:border-gray-700">
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-5 w-full focus:outline-none text-center"
                      value={item.uom}
                      onChange={(e) =>
                        updateItem(item.srNo, 'uom', e.target.value)
                      }
                    />
                  ) : (
                    <span>{item.uom}</span>
                  )}
                </td>

                {/* PRICE */}
                <td className="text-right p-1 border-r border-gray-200 dark:border-gray-700">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-5 w-full focus:outline-none text-right"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(
                          item.srNo,
                          'price',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  ) : (
                    <span>{item.price.toFixed(2)}</span>
                  )}
                </td>

                {/* NET WT */}
                <td className="text-right p-1 border-r border-gray-200 dark:border-gray-700">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-5 w-full focus:outline-none text-right"
                      value={item.netWt}
                      onChange={(e) =>
                        updateItem(
                          item.srNo,
                          'netWt',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  ) : (
                    <span>{item.netWt.toFixed(2)}</span>
                  )}
                </td>

                {/* NET RATE */}
                <td className="text-right p-1 border-r border-gray-200 dark:border-gray-700">
                  <span>{item.netRate.toFixed(2)}</span>
                </td>

                {/* RATE */}
                <td className="text-right p-1 border-r border-gray-200 dark:border-gray-700">
                  <span>{item.rate.toFixed(2)}</span>
                </td>

                {/* GST PERCENT */}
                <td className="text-right p-1 border-r border-gray-200 dark:border-gray-700">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      className="border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-5 w-full focus:outline-none text-right"
                      value={item.gstPercent}
                      onChange={(e) =>
                        updateItem(
                          item.srNo,
                          'gstPercent',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  ) : (
                    <span>{item.gstPercent}%</span>
                  )}
                </td>

                {/* NET TOTAL */}
                <td className="text-right p-1 border-r border-gray-200 dark:border-gray-700 font-bold">
                  <span>{item.net.toFixed(2)}</span>
                </td>

                {/* ACTIONS */}
                <td className="w-[60px] text-center p-1 flex justify-center gap-1">
                  {isEditing ? (
                    <button
                      className="p-0.5 rounded text-gray-500 hover:bg-gray-105 dark:hover:bg-gray-700 hover:text-emerald-500 cursor-pointer"
                      onClick={() => setEditingSrNo(null)}
                      title="Save Row"
                    >
                      <Save size={12} />
                    </button>
                  ) : (
                    <button
                      className="p-0.5 rounded text-gray-500 hover:bg-gray-105 dark:hover:bg-gray-700 hover:text-gray-950 dark:hover:text-white cursor-pointer"
                      onClick={() => setEditingSrNo(item.srNo)}
                      title="Edit Row"
                    >
                      <Edit size={12} />
                    </button>
                  )}
                  <button
                    className="p-0.5 rounded text-gray-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 cursor-pointer"
                    onClick={() => handleDeleteItem(item.srNo)}
                    title="Delete Row"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};