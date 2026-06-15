import React from 'react';
import { Trash2, Edit, Save, Settings } from 'lucide-react';

export interface ColumnConfig {
  showHSN: boolean;
  showUOM: boolean;
  showPrice: boolean;
  showNetWeight: boolean;
  showNetRate: boolean;
  showRate: boolean;
  showGST: boolean;
}

export const DEFAULT_CONFIG: ColumnConfig = {
  showHSN: true,
  showUOM: true,
  showPrice: true,
  showNetWeight: true,
  showNetRate: true,
  showRate: true,
  showGST: true,
};

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
  columnConfig: ColumnConfig;
}

export const ProductListTable: React.FC<ProductListTableProps> = ({
  items,
  setItems,
  editingSrNo,
  setEditingSrNo,
  handleDeleteItem,
  columnConfig
}) => {
  const [focusedCell, setFocusedCell] = React.useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [flashingSrNo, setFlashingSrNo] = React.useState<number | null>(null);
  const prevSrNosRef = React.useRef<Set<number>>(new Set(items.map((item) => item.srNo)));

  React.useEffect(() => {
    const currentSrNos = new Set(items.map((item) => item.srNo));
    const addedSrNo = items.find((item) => !prevSrNosRef.current.has(item.srNo))?.srNo;
    if (addedSrNo !== undefined) {
      setFlashingSrNo(addedSrNo);
      const timer = setTimeout(() => {
        setFlashingSrNo(null);
      }, 850);
      prevSrNosRef.current = currentSrNos;
      return () => {
        clearTimeout(timer);
        setFlashingSrNo(null);
      };
    }
    prevSrNosRef.current = currentSrNos;
  }, [items]);

  const getTabIndex = (rowIndex: number, colIndex: number) => {
    if (!focusedCell) {
      return rowIndex === 0 && colIndex === 1 ? 0 : -1;
    }
    return focusedCell.rowIndex === rowIndex && focusedCell.colIndex === colIndex ? 0 : -1;
  };

  React.useEffect(() => {
    if (focusedCell) {
      const cell = document.querySelector(`[data-row="${focusedCell.rowIndex}"][data-col="${focusedCell.colIndex}"]`) as HTMLElement;
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
    if (items.length === 0) {
      setFocusedCell(null);
    } else if (focusedCell) {
      if (focusedCell.rowIndex >= items.length) {
        setFocusedCell({ rowIndex: items.length - 1, colIndex: focusedCell.colIndex });
      }
    }
  }, [items.length, focusedCell]);

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLTableCellElement>, rowIndex: number, colIndex: number) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT';

    let nextRow = rowIndex;
    let nextCol = colIndex;
    const numRows = items.length;
    const numCols = 5 + 
      (columnConfig.showHSN ? 1 : 0) +
      (columnConfig.showUOM ? 1 : 0) +
      (columnConfig.showPrice ? 1 : 0) +
      (columnConfig.showNetWeight ? 1 : 0) +
      (columnConfig.showNetRate ? 1 : 0) +
      (columnConfig.showRate ? 1 : 0) +
      (columnConfig.showGST ? 1 : 0);

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
          const cell = document.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`) as HTMLElement;
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
        const cell = document.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`) as HTMLElement;
        cell?.focus();
      }, 0);
      return;
    } else if (e.key === 'Delete' && !isInput) {
      e.preventDefault();
      handleDeleteItem(items[rowIndex].srNo);
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

  const visibleOptionalCount = Object.values(columnConfig).filter(Boolean).length;

  const headers = [
    { key: 'srNo', className: "w-[35px] text-center p-1 border-r border-border-sec sticky top-0 bg-app-bg z-10", label: "Sr." },
    { 
      key: 'name', 
      className: `${
        visibleOptionalCount === 0 ? 'w-[55%]' :
        visibleOptionalCount <= 2 ? 'w-[45%]' :
        visibleOptionalCount <= 4 ? 'w-[38%]' :
        'w-[30%]'
      } p-1 border-r border-border-sec sticky top-0 bg-app-bg z-10 transition-all duration-150`, 
      label: "Product Name" 
    },
    columnConfig.showHSN && { key: 'hsn', className: "p-1 border-r border-border-sec sticky top-0 bg-app-bg z-10", label: "HSN" },
    { key: 'quantity', className: "text-right p-1 border-r border-border-sec sticky top-0 bg-app-bg z-10", label: "Quantity" },
    columnConfig.showUOM && { key: 'uom', className: "text-center p-1 border-r border-border-sec sticky top-0 bg-app-bg z-10", label: "UOM" },
    columnConfig.showPrice && { key: 'price', className: "text-right p-1 border-r border-border-sec sticky top-0 bg-app-bg z-10", label: "Price (with GST)" },
    columnConfig.showNetWeight && { key: 'netWt', className: "text-right p-1 border-r border-border-sec sticky top-0 bg-app-bg z-10", label: "Net Wt." },
    columnConfig.showNetRate && { key: 'netRate', className: "text-right p-1 border-r border-border-sec sticky top-0 bg-app-bg z-10", label: "Net Rate" },
    columnConfig.showRate && { key: 'rate', className: "text-right p-1 border-r border-border-sec sticky top-0 bg-app-bg z-10", label: "Rate" },
    columnConfig.showGST && { key: 'gstPercent', className: "text-right p-1 border-r border-border-sec sticky top-0 bg-app-bg z-10", label: "GST %" },
    { key: 'net', className: "text-right p-1 border-r border-border-sec font-bold sticky top-0 bg-app-bg z-10", label: "Net (Total)" },
    { key: 'actions', className: "w-[60px] text-center p-1 sticky top-0 bg-app-bg z-10", label: "Actions" }
  ].filter((c): c is Exclude<typeof c, boolean | undefined | null | false> => !!c);

  return (
    <div
      className="overflow-auto border border-border-main bg-panel-bg rounded mb-1.5 transition-colors duration-150 h-full"
    >
      <table className="w-full min-w-[900px] lg:min-w-full border-collapse text-left" role="grid" aria-colcount={headers.length} aria-rowcount={items.length + 1}>
          <thead>
            <tr
              className="font-bold text-table-header border-b bg-app-bg text-text-main border-border-sec"
            >
              {headers.map((h) => (
                <th key={h.key} className={h.className} role="columnheader">
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const isEditing = editingSrNo === item.srNo;
              const isFlashing = flashingSrNo === item.srNo;
              
              const rowCells = [
                {
                  key: 'srNo',
                  className: "w-[35px] text-center p-1 border-r border-border-sec",
                  render: () => item.srNo
                },
                {
                  key: 'name',
                  className: "p-1 border-r border-border-sec",
                  render: () => isEditing ? (
                    <input
                      type="text"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none"
                      value={item.name}
                      onChange={(e) => updateItem(item.srNo, 'name', e.target.value)}
                    />
                  ) : (
                    <span className="font-medium">{item.name}</span>
                  )
                },
                columnConfig.showHSN && {
                  key: 'hsn',
                  className: "p-1 border-r border-border-sec",
                  render: () => isEditing ? (
                    <input
                      type="text"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none"
                      value={item.hsn}
                      onChange={(e) => updateItem(item.srNo, 'hsn', e.target.value)}
                    />
                  ) : (
                    <span>{item.hsn}</span>
                  )
                },
                {
                  key: 'quantity',
                  className: "text-right p-1 border-r border-border-sec",
                  render: () => isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none text-right"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.srNo, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  ) : (
                    <span>{item.quantity.toFixed(2)}</span>
                  )
                },
                columnConfig.showUOM && {
                  key: 'uom',
                  className: "text-center p-1 border-r border-border-sec",
                  render: () => isEditing ? (
                    <input
                      type="text"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none text-center"
                      value={item.uom}
                      onChange={(e) => updateItem(item.srNo, 'uom', e.target.value)}
                    />
                  ) : (
                    <span>{item.uom}</span>
                  )
                },
                columnConfig.showPrice && {
                  key: 'price',
                  className: "text-right p-1 border-r border-border-sec",
                  render: () => isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none text-right"
                      value={item.price}
                      onChange={(e) => updateItem(item.srNo, 'price', parseFloat(e.target.value) || 0)}
                    />
                  ) : (
                    <span>{item.price.toFixed(2)}</span>
                  )
                },
                columnConfig.showNetWeight && {
                  key: 'netWt',
                  className: "text-right p-1 border-r border-border-sec",
                  render: () => isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none text-right"
                      value={item.netWt}
                      onChange={(e) => updateItem(item.srNo, 'netWt', parseFloat(e.target.value) || 0)}
                    />
                  ) : (
                    <span>{item.netWt.toFixed(2)}</span>
                  )
                },
                columnConfig.showNetRate && {
                  key: 'netRate',
                  className: "text-right p-1 border-r border-border-sec",
                  render: () => <span>{item.netRate.toFixed(2)}</span>
                },
                columnConfig.showRate && {
                  key: 'rate',
                  className: "text-right p-1 border-r border-border-sec",
                  render: () => <span>{item.rate.toFixed(2)}</span>
                },
                columnConfig.showGST && {
                  key: 'gstPercent',
                  className: "text-right p-1 border-r border-border-sec",
                  render: () => isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      className="border border-inp-border rounded px-1 py-0.5 text-table-body bg-inp-bg text-inp-text h-5 w-full focus:outline-none text-right"
                      value={item.gstPercent}
                      onChange={(e) => updateItem(item.srNo, 'gstPercent', parseFloat(e.target.value) || 0)}
                    />
                  ) : (
                    <span>{item.gstPercent}%</span>
                  )
                },
                {
                  key: 'net',
                  className: "text-right p-1 border-r border-border-sec font-bold",
                  render: () => <span>{item.net.toFixed(2)}</span>
                },
                {
                  key: 'actions',
                  className: "w-[60px] text-center p-1 flex justify-center gap-1",
                  render: () => (
                    <>
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
                    </>
                  )
                }
              ].filter((c): c is Exclude<typeof c, boolean | undefined | null | false> => !!c);

              return (
                <tr
                  key={item.srNo}
                  role="row"
                  className={`border-b text-table-body font-medium transition-colors duration-150 hover:bg-app-bg/50 border-border-sec text-text-main odd:bg-panel-bg even:bg-app-bg/25 ${
                    isFlashing ? 'animate-row-flash' : ''
                  }`}
                >
                  {rowCells.map((cell, cellColIdx) => (
                    <td
                      key={cell.key}
                      className={cell.className}
                      role="gridcell"
                      tabIndex={getTabIndex(idx, cellColIdx)}
                      data-row={idx}
                      data-col={cellColIdx}
                      onKeyDown={(e) => handleCellKeyDown(e, idx, cellColIdx)}
                      onFocus={() => setFocusedCell({ rowIndex: idx, colIndex: cellColIdx })}
                    >
                      {cell.render()}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  );
};