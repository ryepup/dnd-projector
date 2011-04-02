(in-package :dnd-projector)
(defvar *current-combat* nil)

(defclass combat ()
  ((players :accessor players :initform (list))
   (max-id :accessor max-id :initform 0)
   (current-init :accessor current-init :initform 0)))

(defmethod (setf players) :after (new-value (self combat))
  (projector-event (list :reset)))

(defun make-combat () (make-instance 'combat))

(defclass player ()
  ((name :accessor name :initarg :name)
   (initiative :accessor initiative :initarg :initiative
	       :initform 0)
   (bloodied-p :accessor bloodied-p :initform nil
	       :initarg :bloodied-p)
   (hostile-p :accessor hostile-p :initarg :hostile-p
	      :initform nil)
   (damage :accessor damage :initform 0)
   (id :accessor id :initarg :id)))

(defmethod print-object ((instance player) stream)
  (print-unreadable-object (instance stream)
    (with-slots (name id damage initiative) instance
      (format stream "~a | id:~a dmg:~a init:~a" name id damage initiative))))

(defmethod (setf damage) :before (new-value (self player))
  (projector-event (list :damage
			 
			 (list (cons :pid (id self))
			       (cons :old (damage self))
			       (cons :damage new-value)))))

(defmethod (setf bloodied-p) :after (new-value (self player))
  (projector-event (list :bloody
			 (list (cons :pid (id self))
			       (cons :bloody new-value)))))

(defun ensure-combat (&optional reset (init-bonus 2))
  (when (or reset (null *current-combat*))
    (setf *current-combat* (make-combat))
    (iter (for n in '("Ryepup" "Jack" "Ecthellion" "Tibbar" "Ammonia"))
	  (for mod in '(12 9 11 9 16))
	  (add-player n nil (+ mod (d20) init-bonus) *current-combat* nil))
    (sort-players)))

(defun sort-players ()
  (setf (players *current-combat*)
	(sort (players *current-combat*) #'> :key #'initiative)

	(current-init *current-combat*) (iter (for p in (players *current-combat*))
					      (maximize (initiative p)))))

(defun turn ()
  (let ((pl (pop (players *current-combat*))))
    (setf (players *current-combat*)
	  (append (players *current-combat*) (list pl)))))

(defmethod player-by-id ((c combat) (id string))
  (player-by-id c (parse-integer id)))
(defmethod player-by-id ((c combat) (id integer))
  (find id (players c) :key #'id))

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
	  (setf (id pl) (lookup :id p))))
      (setf (players c) (nreverse (players c)))
      c)))

(defun add-player (name &optional (hostile-p T) (initiative 0) (combat *current-combat*) (bloodied-p nil))
  (let ((p (make-instance 'player :name name
		       :initiative initiative
		       :hostile-p hostile-p
		       :bloodied-p bloodied-p
		       :id (incf (max-id combat)))))
    (push p (players combat))
    p))
(defvar *d20-state* (make-random-state))
(defun d20 ()
  (1+ (random 20 *d20-state*)))

(defun add-hostiles (name int-mod &key (n 1 nsupplied) (start 1))
  (if nsupplied
      (dotimes (i n)
	(add-hostiles (format nil "~a ~a" name (+ start i)) int-mod))
      (add-player name T (+ int-mod (d20)))))

(defun kill (&rest ids)
  (setf (players *current-combat*)
	(remove-if (lambda (id) (member id ids))
		   (players *current-combat*)
		   :key #'id)))

(defun damagem (amt &rest ids)
  (dolist (id ids)
    (incf (damage (player-by-id *current-combat* id))
	  amt)))

(defun bloodym (bloodyp &rest ids)
  (dolist (id ids)
    (setf (bloodied-p (player-by-id *current-combat* id))
	  bloodyp)))

(defgeneric rename (thing new-name)
  (:method ((id integer) name)
    (rename (player-by-id *current-combat* id) name))
  (:method ((p player) name)
    (setf (name p) name)))

(defmethod initiative ((id integer))
  (initiative (player-by-id *current-combat* id)))

(defmethod (setf initiative) (new-init (id integer))
  (setf (initiative (player-by-id *current-combat* id))
	new-init))
 

(defun move-up (id)
  (let* ((p (player-by-id *current-combat* id))
	 (ps (players *current-combat*))
	 (ppos (position p ps))
	 (before (subseq ps 0 ppos))
	 (after (remove p (subseq ps ppos))))
 
    (if before
	(let ((l (last before)))
	  (alexandria:flatten (list (reverse (rest (reverse before)))
				    p
				    l after)))
	(let ((l (last after)))
	  (alexandria:flatten (list (reverse (rest (reverse after)))
				    p
				    l
				    )))
	
	))
  )

(defun !move-up (id)
  (setf (players *current-combat*) (move-up id)))