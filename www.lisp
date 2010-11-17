(in-package :dnd-projector)
(defvar *current-combat* nil)
(defun entry-points ()
  (push
   (hunchentoot:create-folder-dispatcher-and-handler "/s/" #P"/home/ryan/clbuild/source/dnd-projector/www/")
   hunchentoot:*dispatch-table*))

(defvar *tal-generator* (make-instance 'yaclml:file-system-generator
		       :cachep T
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
  (unless *current-combat*
    (setf *current-combat* (make-combat))
    (iter (for n in '("Ryepup" "Jack" "Ecthellion" "Tibbar" "Ammonia"))
	  (add-player n 0 nil *current-combat*)))
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

(defun sort-players ()
  (setf (players *current-combat*)
	(sort (players *current-combat*) #'> :key #'initiative)))

(hunchentoot:define-easy-handler (scribe-turn :uri "/scribe-turn") ()
  (turn)
  (hunchentoot:redirect "/scribe"))

(defun turn ()
  (let ((pl (pop (players *current-combat*))))
    (setf (players *current-combat*)
	  (append (players *current-combat*) (list pl)))))

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
  (setf (players *current-combat*)
	(remove (parse-integer id) (players *current-combat*)
		:key #'id))
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
  (render-tal "projector.tal" (yaclml:tal-env 'players
				    (iter
				      (for p in (players *current-combat*))
				      (collect (yaclml:tal-env
					      'name (name p)
					      'initiative (initiative p)
					      'bloody (if (bloodied-p p) "bloody" "")
					      'css-class (if (hostile-p p) "hostile" "")
					      'damage (damage p)))))))



(defclass combat ()
  ((players :accessor players :initform (list))
   (max-id :accessor max-id :initform 0)))
(defun make-combat () (make-instance 'combat))
(defmethod player-by-id ((c combat) id)
  (find (parse-integer id) (players c)
	:key #'id))

(defclass player ()
  ((name :accessor name :initarg :name)
   (initiative :accessor initiative :initarg :initiative :initform 0)
   (bloodied-p :accessor bloodied-p :initform nil :initarg :bloodied-p)
   (hostile-p :accessor hostile-p :initarg :hostile-p :initform nil)
   (damage :accessor damage :initform 0)
   (id :accessor id :initarg :id)))

(defun add-player (name &optional (hostile-p T) (initiative 0) (combat *current-combat*) (bloodied-p nil))
  (let ((p (make-instance 'player :name name
		       :initiative initiative
		       :hostile-p hostile-p
		       :bloodied-p bloodied-p
		       :id (incf (max-id combat)))))
    (push p (players combat))
    p))

(defun deserialize-combat-from-string (json)
  (flet ((lookup (key alist) (cdr (assoc key alist))))
    (let ((json (json:decode-json-from-string json))
	  (c (make-combat )))
      (setf (max-id c) (lookup :max-id json))
      (dolist (p (lookup :players json))
	(let ((pl (add-player (lookup :name p)
			      (lookup :hostile-p p)
			      (lookup :initiative p)
			      c)))
	  (setf (id pl) (lookup :id p))
	  ))
      (setf (players c) (nreverse (players c)))
      c
      ))
  )