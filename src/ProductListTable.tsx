import React from 'react';
import { Trash2, Edit, Save } from 'lucide-react';
import { useKeyboardField } from './KeyboardRegistryContext';

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
  const [focusedCell, setFocusedCell] = React.useState<{ rowIndex: number; colIndex: number } | null>(null);
  const cellRefs = React.useRef<Map<string, HTMLElement | null>>(new Map());

  // Register the table container in keyboard registry
  const containerRef = useKeyboardField({
    id: 'productTable',
    group: 'main',
  });

  const getTabIndex = (rowIndex: number, colIndex: number) => {
    if (!focusedCell) {
      return rowIndex === 0 && colIndex === 1 ? 0 : -1;
    }
    return focusedCell.rowIndex === rowIndex && focusedCell.colIndex === colIndex ? 0 : -1;
  };

  React.useEffect(() => {
    if (focusedCell) {
      const cell = cellRefs.current.get(`${focusedCell.rowIndex}-${focusedCell.colIndex}`);
      if (cell) {
        const input = cell.querySelector('input') as HTMLElement;
        if (input) {
          input.focus();
        } else {
          cell.focus();
        }
      }
    }
  }, [focusedCell, editingSrNo]);

  React.useEffect(() => {
    if (focusedCell && items.length > 0) {
      if (focusedCell.rowIndex >= items.length) {
        setFocusedCell({ rowIndex: items.length - 1, colIndex: focusedCell.colIndex });
      }
    }
  }, [items.length, focusedCell]);

  const handleContainerFocus = (e: React.FocusEvent) => {
    if (e.target === e.currentTarget) {
      const activeRow = focusedCell?.rowIndex ?? 0;
      const activeCol = focusedCell?.colIndex ?? 1;
      const cell = cellRefs.current.get(`${activeRow}-${activeCol}`);
      if (cell) {
        const input = cell.querySelector('input') as HTMLElement;
        if (input) {
          input.focus();
        } else {
          cell.focus();
        }
      }
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLTableCellElement>, rowIndex: number, colIndex: number) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT';

    let nextRow = rowIndex;
    let nextCol = colIndex;
    const numRows = items.length;
    const numCols = 12; // 12 columns total

    if (e.key === 'ArrowUp' && !isInput) {
      e.preventDefault();
      nextRow = Math.max(0, rowIndex - 1);
    } else if (e.key === 'ArrowDown' && !isInput) {
      e.preventDefault();
      nextRow = Math.min(numRows - 1, rowIndex + 1);
    } else if (e.key === 'ArrowLeft' && !isInput) {
      e.preventDefault();
      nextCol = Math.max(0, colIndex - 1);
    } else if (e.key === 'ArrowRight' && !isInput) {
      e.preventDefault();
      nextCol = Math.min(numCols - 1, colIndex + 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isInput) {
        setEditingSrNo(null);
        setTimeout(() => {
          const cell = cellRefs.current.get(`${rowIndex}-${colIndex}`);
          cell?.focus();
        }, 0);
      } else {
        setEditingSrNo(items[rowIndex].srNo);
      }
      return;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingSrNo(null);
      setTimeout(() => {
        const cell = cellRefs.current.get(`${rowIndex}-${colIndex}`);
        cell?.focus();
      }, 0);
      return;
    } else {
      return;
    }

    setFocusedCell({ rowIndex: nextRow, colIndex: nextCol });
  };

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
      ref={containerRef}
      tabIndex={0}
      onFocus={handleContainerFocus}
      className="overflow-auto border border-border-main bg-panel-bg rounded mb-1.5 transition-colors duration-150 h-full focus:outline-none"
    >
      <table className="w-full min-w-[900px] lg:min-w-full border-collapse text-left" role="grid" aria-colcount={12} aria-rowcount={items.length + 1}>
        <thead>
          <tr
            className="font-bold text-table-header border-b bg-app-bg text-text-main border-border-sec"
          >
            <th className="w-[35px] text-center p-1 border-r border-border-sec" role="columnheader">
              Sr.
            </th>
            <th className="w-[30%] p-1 border-r border-border-sec" role="columnheader">
              Product Name
            </th>
            <th className="p-1 border-r border-border-sec" role="columnheader">
              HSN
            </th>
            <th className="text-right p-1 border-r border-border-sec" role="columnheader">
              Quantity
            </th>
            <th className="text-center p-1 border-r border-border-sec" role="columnheader">
              UOM
            </th>
            <th className="text-right p-1 border-r border-border-sec" role="columnheader">
              Price (with GST)
            </th>
            <th className="text-right p-1 border-r border-border-sec" role="columnheader">
              Net Wt.
            </th>
            <th className="text-right p-1 border-r border-border-sec" role="columnheader">
              Net Rate
            </th>
            <th className="text-right p-1 border-r border-border-sec" role="columnheader">
              Rate
            </th>
            <th className="text-right p-1 border-r border-border-sec" role="columnheader">
              GST %
            </th>
            <th className="text-right p-1 border-r border-border-sec font-bold" role="columnheader">
              Net (Total)
            </th>
            <th className="w-[60px] text-center p-1" role="columnheader">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const isEditing = editingSrNo === item.srNo;
            return (
              <tr
                key={item.srNo}
                role="row"
                className="border-b text-table-body font-medium transition-colors duration-150 hover:bg-app-bg/50 border-border-sec text-text-main odd:bg-panel-bg even:bg-app-bg/25"
              >
                {/* SR NO */}
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-0`, el);
                    else cellRefs.current.delete(`${idx}-0`);
                  }}
                  className="w-[35px] text-center p-1 border-r border-border-sec"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 0)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 0)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 0 })}
                >
                  {item.srNo}
                </td>

                {/* PRODUCT NAME */}
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-1`, el);
                    else cellRefs.current.delete(`${idx}-1`);
                  }}
                  className="p-1 border-r border-border-sec"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 1)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 1)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 1 })}
                >
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
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-2`, el);
                    else cellRefs.current.delete(`${idx}-2`);
                  }}
                  className="p-1 border-r border-border-sec"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 2)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 2)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 2 })}
                >
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
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-3`, el);
                    else cellRefs.current.delete(`${idx}-3`);
                  }}
                  className="text-right p-1 border-r border-border-sec"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 3)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 3)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 3 })}
                >
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
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-4`, el);
                    else cellRefs.current.delete(`${idx}-4`);
                  }}
                  className="text-center p-1 border-r border-border-sec"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 4)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 4)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 4 })}
                >
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
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-5`, el);
                    else cellRefs.current.delete(`${idx}-5`);
                  }}
                  className="text-right p-1 border-r border-border-sec"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 5)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 5)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 5 })}
                >
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
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-6`, el);
                    else cellRefs.current.delete(`${idx}-6`);
                  }}
                  className="text-right p-1 border-r border-border-sec"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 6)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 6)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 6 })}
                >
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
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-7`, el);
                    else cellRefs.current.delete(`${idx}-7`);
                  }}
                  className="text-right p-1 border-r border-border-sec"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 7)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 7)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 7 })}
                >
                  <span>{item.netRate.toFixed(2)}</span>
                </td>

                {/* RATE */}
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-8`, el);
                    else cellRefs.current.delete(`${idx}-8`);
                  }}
                  className="text-right p-1 border-r border-border-sec"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 8)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 8)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 8 })}
                >
                  <span>{item.rate.toFixed(2)}</span>
                </td>

                {/* GST PERCENT */}
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-9`, el);
                    else cellRefs.current.delete(`${idx}-9`);
                  }}
                  className="text-right p-1 border-r border-border-sec"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 9)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 9)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 9 })}
                >
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
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-10`, el);
                    else cellRefs.current.delete(`${idx}-10`);
                  }}
                  className="text-right p-1 border-r border-border-sec font-bold"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 10)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 10)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 10 })}
                >
                  <span>{item.net.toFixed(2)}</span>
                </td>

                {/* ACTIONS */}
                <td 
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${idx}-11`, el);
                    else cellRefs.current.delete(`${idx}-11`);
                  }}
                  className="w-[60px] text-center p-1 flex justify-center gap-1"
                  role="gridcell"
                  tabIndex={getTabIndex(idx, 11)}
                  onKeyDown={(e) => handleCellKeyDown(e, idx, 11)}
                  onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: 11 })}
                >
                  {isEditing ? (
                    <button
                      className="p-0.5 rounded text-text-mute hover:bg-emerald-light hover:text-text-acc cursor-pointer"
                      onClick={() => setEditingSrNo(null)}
                      title="Save Row"
                      tabIndex={-1}
                    >
                      <Save size={12} />
                    </button>
                  ) : (
                    <button
                      className="p-0.5 rounded text-text-mute hover:bg-app-bg hover:text-text-main cursor-pointer"
                      onClick={() => setEditingSrNo(item.srNo)}
                      title="Edit Row"
                      tabIndex={-1}
                    >
                      <Edit size={12} />
                    </button>
                  )}
                  <button
                    className="p-0.5 rounded text-text-mute hover:bg-alert/10 hover:text-alert cursor-pointer"
                    onClick={() => handleDeleteItem(item.srNo)}
                    title="Delete Row"
                    tabIndex={-1}
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