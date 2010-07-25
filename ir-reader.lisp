(in-package :dnd-projector)

;;command map
(defvar *key-map*
  '((11028 . :power)
    (9492 . :mute)
    (788 . 1) (1300 . 2)
    (1812 . 3) (2324 . 4)
    (2836 . 5) (3348 . 6)
    (3860 . 7) (4372 . 8)
    (4884 . 9) (8980 . :recall)
    (276 . 0) (16660 . :prev-ch)
    (12052 . :up) (12564 . :down)
    (10516 . :left) (10004 . :right)
    (17684 . :menu) (15124 . :select)
    (17172 . :enter) (23828 . :add-erase)
    (15636 . :adjust-left) (16148 . :adjust-right)))


(defvar *incoming-ir-channel* (make-instance 'chanl:bounded-channel
					     :size 3))

(defun process-code (code)
  (let ((key (cdr (assoc code *key-map*))))
    (if (eq :power key) nil
	(progn
	  (chanl:send *incoming-ir-channel* key)
	  T))))

(defun read-ir-commands ()
  (let ((ar (make-instance 'cl-arduino:arduino)))
    (iter (for code = (cl-arduino:ir-read ar 7))
	  (while (process-code code))
	  (sleep .2))
    (cl-arduino:disconnect ar)))