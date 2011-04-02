(in-package :dnd-projector)

(defun start-server ()
  (hunchentoot:start (make-instance 'hunchentoot:acceptor :port 9081)))

(hunchentoot:define-easy-handler (players.json :uri "/players.json") ()
  (ensure-combat)
  (json:encode-json-to-string (players *current-combat*)))

(hunchentoot:define-easy-handler (projector.json :uri "/projector.json") ()
  (let ((event (chanl:recv *event-queue*)))
    (json:encode-json-to-string event)))


;; (defun move-down (id)
;;   (let* ((p (player-by-id *current-combat* id))
;; 	 (ps (players *current-combat*))
;; 	 (ppos (position p ps))
;; 	 (before (subseq ps 0 ppos))
;; 	 (after (remove p (subseq ps ppos))))
 
;;     (if before
;; 	(let ((l (last before)))
;; 	  (alexandria:flatten (list
;; 			       before
;; 			       (pop after)
;; 			       p
;; 			       after)))
;; 	(let ((l (last after)))
;; 	  (alexandria:flatten (list (reverse (rest (reverse after)))
;; 				    p
;; 				    l
;; 				    )))
	
;; 	))
;;   )