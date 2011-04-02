(in-package :dnd-projector)

(defun entry-points ()
  (push
   (hunchentoot:create-folder-dispatcher-and-handler "/s/" #P"/home/ryan/clbuild/source/dnd-projector/www/")
   hunchentoot:*dispatch-table*))

(defvar *tal-generator* (make-instance 'yaclml:file-system-generator
		       :cachep nil
		       :root-directories (list #P"/home/ryan/clbuild/source/dnd-projector/templates/")))

(defun render-tal (tal-file &optional tal-env)
  (concatenate 'string
	       "<!DOCTYPE html>
"
	       (yaclml:with-yaclml-output-to-string
		 (funcall
		  (yaclml:load-tal *tal-generator* tal-file)
		  tal-env
		  *tal-generator*))))

(hunchentoot:define-easy-handler (home :uri "/home") ()
  (hunchentoot:start-session)
  (render-tal "home.tal"))

(hunchentoot:define-easy-handler (combat :uri "/combat") ()
  (render-tal "combat.tal"))

(hunchentoot:define-easy-handler (combat-display :uri "/combat-display") ()
  (render-tal "combat-display.tal"))


(hunchentoot:define-easy-handler (scribe :uri "/scribe") ()
  (ensure-combat)
  (render-tal "scribe.tal" (yaclml:tal-env 'players
				    (iter
				      (for p in (players *current-combat*))
				      (collect (yaclml:tal-env
					      'name (name p)
					      'id (id p)
					      'initiative (initiative p)
					      'css-class (if (hostile-p p) "hostile" "")
					      'damage (damage p)))))))


(hunchentoot:define-easy-handler (scribe-add :uri "/scribe-add") (name initiative hostile-p)
  (add-player name
	      (string-equal hostile-p "T")
	      (parse-integer initiative)
	      *current-combat*)
  (hunchentoot:redirect "/scribe#addPlayer"))

(hunchentoot:define-easy-handler (scribe-sort :uri "/scribe-sort") ()
  (sort-players)
  (hunchentoot:redirect "/scribe"))


(hunchentoot:define-easy-handler (scribe-turn :uri "/scribe-turn") ()
  (turn)
  (hunchentoot:redirect "/scribe"))


(hunchentoot:define-easy-handler (scribe-edit :uri "/scribe-edit") (id)
  (let ((player (player-by-id *current-combat* id)))
     (render-tal "edit-player.tal"
		 (yaclml:tal-env 'id (id player)
				 'name (name player)
				 'bloodied (if (bloodied-p player)
					       "unbloody"
					       "bloody")
				 'initiative (initiative player)))
 ))

(hunchentoot:define-easy-handler (scribe-bloody :uri "/scribe-bloody") (id)
  (let ((player (player-by-id *current-combat* id)))
    (setf (bloodied-p player) (not (bloodied-p player)))
    (hunchentoot:redirect "/scribe")))

(hunchentoot:define-easy-handler (scribe-kill :uri "/scribe-kill") (id)
  (kill (parse-integer id))
  (hunchentoot:redirect "/scribe"))

(hunchentoot:define-easy-handler (scribe-save :uri "/scribe-save") (id damage healing new-initiative)
  (let ((player  (player-by-id *current-combat* id))
	(dmg (- (parse-integer damage)
		(parse-integer healing)))
	(init (parse-integer new-initiative)))
    (incf (damage player) dmg)
    (setf (initiative player) init
	  (damage player) (max 0 (damage player)))
    (hunchentoot:redirect "/scribe")))

(hunchentoot:define-easy-handler (projector :uri "/projector") ()
  (render-tal "projector.tal" (yaclml:tal-env
			       'current-init (current-init *current-combat*)
			       'players
				    (iter
				      (for p in (players *current-combat*))
				      (collect (yaclml:tal-env
					      'name (name p) 
					      'pid (id p)
					      'initiative (initiative p)
					      'bloody (if (bloodied-p p) "bloody" "")
					      'css-class (if (hostile-p p) "hostile" "")
					      'damage (damage p)))))))

(hunchentoot:define-easy-handler (players.json :uri "/players.json") ()
  (ensure-combat)
  (json:encode-json-to-string (players *current-combat*)))

(defvar *event-queue* (make-instance 'chanl:bounded-channel :size 100) "list of events")

(defun projector-event (thing)
  (chanl:send *event-queue* thing))

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