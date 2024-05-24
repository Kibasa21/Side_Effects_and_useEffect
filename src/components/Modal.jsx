import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, children, onClose }) {
  const dialog = useRef();

  useEffect(() => {
    if(open){
      dialog.current.showModal();
    } else {
      dialog.current.close();
    }
  }, [open]); //esse effect vão rodar de novo se essa dependency mudar

  return createPortal(
    <dialog className="modal" ref={dialog} onClose={onClose}>
      {open ? children : null}
    </dialog>,
    document.getElementById('modal')
  );
}
