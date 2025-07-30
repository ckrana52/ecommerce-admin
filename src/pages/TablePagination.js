  <button className="px-2 py-1 rounded-md border" disabled={!canPrev} onClick={() => onPageChange(1)}>{'|<'}</button>
  <button className="px-2 py-1 rounded-md border" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>{'<'}</button>
  <button className="px-2 py-1 rounded-md border" disabled={!canNext} onClick={() => onPageChange(page + 1)}>{'>'}</button>
  <button className="px-2 py-1 rounded-md border" disabled={!canNext} onClick={() => onPageChange(totalPages)}>{'>|'}</button>
  <select
    className="border rounded-md p-1" 