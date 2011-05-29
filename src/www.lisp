(in-package :dnd-projector)

(defvar *httpd* (make-instance 'hunchentoot:acceptor :port 9081))
(defun start-server ()
  (hunchentoot:start *httpd*))

(hunchentoot:define-easy-handler (players.json :uri "/players.json") ()
  (ensure-combat)
  (json:encode-json-to-string (players *current-combat*)))

(hunchentoot:define-easy-handler (projector.json :uri "/projector.json") ()

  (json:encode-json-to-string
   (if (plusp (length *events*))
       (prog1 (car (last *events*))
	 (setf *events*
	       (reverse
		(rest (reverse *events*))))
	 )
       (progn
	 (sleep 1)
	 (list :noop))))
  )

(hunchentoot:define-easy-handler (turn.json :uri "/turn.json") ()
  (turn)
  (json:encode-json-to-string (players *current-combat*)))

(hunchentoot:define-easy-handler (sort.json :uri "/sort.json") ()
  (sort-players)
  (json:encode-json-to-string (players *current-combat*)))

(hunchentoot:define-easy-handler (kill.json :uri "/kill.json")
    ((id :parameter-type 'integer))
  (kill id)
  (json:encode-json-to-string (players *current-combat*)))

(hunchentoot:define-easy-handler (reset.json :uri "/reset.json") ()
  (ensure-combat T)
  (json:encode-json-to-string (players *current-combat*)))

(hunchentoot:define-easy-handler (player.json :uri "/player.json")
    ((id :parameter-type 'integer) name bloodyp
     (initiative :parameter-type 'integer)
     (damage :parameter-type 'integer))

  (let ((foo))
    (handler-bind ((event-added #'(lambda (cnd)
				    (declare (ignore cnd))
				    (setf foo T))))
      (if name
	  (rename id name))
      (if bloodyp
	  (bloodym :toggle id))
      (if initiative
	  (setf (initiative id) initiative))
      (if damage
	  (damagem damage id)))
    (unless foo
      (projector-event (list :reset))))

  (json:encode-json-to-string (players *current-combat*)))

(hunchentoot:define-easy-handler (add-hostiles.json :uri "/add-hostiles.json")
    (name
     (init :parameter-type 'integer)
     (n :parameter-type 'integer))
  (add-hostiles name init :n n)
  
  (json:encode-json-to-string (players *current-combat*)))

(hunchentoot:define-easy-handler (move-up.json :uri "/move-up.json")
    ((id :parameter-type 'integer))
  (!move-up id)
  (json:encode-json-to-string (players *current-combat*)))

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