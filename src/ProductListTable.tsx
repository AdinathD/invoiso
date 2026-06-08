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
}

export const ProductListTable: React.FC<ProductListTableProps> = ({
  items,
  setItems,
  editingSrNo,
  setEditingSrNo,
  handleDeleteItem,
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
      className="overflow-auto border border-border-main bg-panel-bg rounded mb-1.5 transition-colors duration-150 h-full"
    >
      <table className="w-full min-w-[900px] lg:min-w-full border-collapse text-left">
        <thead>
          <tr
            className="font-bold text-table-header border-b bg-app-bg text-text-main border-border-sec"
          >
            <th className="w-[35px] text-center p-1 border-r border-border-sec">
              Sr.
            </th>
            <th className="w-[30%] p-1 border-r border-border-sec">
              Product Name
            </th>
            <th className="p-1 border-r border-border-sec">
              HSN
            </th>
            <th className="text-right p-1 border-r border-border-sec">
              Quantity
            </th>
            <th className="text-center p-1 border-r border-border-sec">
              UOM
            </th>
            <th className="text-right p-1 border-r border-border-sec">
              Price (with GST)
            </th>
            <th className="text-right p-1 border-r border-border-sec">
              Net Wt.
            </th>
            <th className="text-right p-1 border-r border-border-sec">
              Net Rate
            </th>
            <th className="text-right p-1 border-r border-border-sec">
              Rate
            </th>
            <th className="text-right p-1 border-r border-border-sec">
              GST %
            </th>
            <th className="text-right p-1 border-r border-border-sec font-bold">
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
                className="border-b text-table-body font-medium transition-colors duration-150 hover:bg-app-bg/50 border-border-sec text-text-main odd:bg-panel-bg even:bg-app-bg/25"
              >
                {/* SR NO */}
                <td className="w-[35px] text-center p-1 border-r border-border-sec">
                  {item.srNo}
                </td>

                {/* PRODUCT NAME */}
                <td className="p-1 border-r border-border-sec">
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none"
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
                <td className="p-1 border-r border-border-sec">
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none"
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
                <td className="text-right p-1 border-r border-border-sec">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none text-right"
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
                <td className="text-center p-1 border-r border-border-sec">
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none text-center"
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
                <td className="text-right p-1 border-r border-border-sec">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none text-right"
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
                <td className="text-right p-1 border-r border-border-sec">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none text-right"
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
                <td className="text-right p-1 border-r border-border-sec">
                  <span>{item.netRate.toFixed(2)}</span>
                </td>

                {/* RATE */}
                <td className="text-right p-1 border-r border-border-sec">
                  <span>{item.rate.toFixed(2)}</span>
                </td>

                {/* GST PERCENT */}
                <td className="text-right p-1 border-r border-border-sec">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none text-right"
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
                <td className="text-right p-1 border-r border-border-sec font-bold">
                  <span>{item.net.toFixed(2)}</span>
                </td>

                {/* ACTIONS */}
                <td className="w-[60px] text-center p-1 flex justify-center gap-1">
                  {isEditing ? (
                    <button
                      className="p-0.5 rounded text-text-mute hover:bg-emerald-light hover:text-text-acc cursor-pointer"
                      onClick={() => setEditingSrNo(null)}
                      title="Save Row"
                    >
                      <Save size={12} />
                    </button>
                  ) : (
                    <button
                      className="p-0.5 rounded text-text-mute hover:bg-app-bg hover:text-text-main cursor-pointer"
                      onClick={() => setEditingSrNo(item.srNo)}
                      title="Edit Row"
                    >
                      <Edit size={12} />
                    </button>
                  )}
                  <button
                    className="p-0.5 rounded text-text-mute hover:bg-alert/10 hover:text-alert cursor-pointer"
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