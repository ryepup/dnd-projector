(in-package :dnd-projector)
;; This file has various definitions for players, combats, and manipulating those

(defclass combat ()
  ((players :accessor players :initform (list))
   (max-id :accessor max-id :initform 0)
   (hostile-count :accessor hostile-count :initform 1)
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

(defun sort-players (&optional (combat *current-combat*))
  "destructively sorts the active players list"
  (setf (players combat)
	(sort (players combat) #'> :key #'initiative)

	(current-init combat)
	(iter (for p in (players combat))
	      (maximize (initiative p)))))

(defun turn (&optional (combat *current-combat*))
  (let ((pl (pop (players combat))))
    (setf (players combat)
	  (append (players combat) (list pl)))))

(defgeneric player-by-id (combat thing)
  (:method ((c combat) (id string))
    (player-by-id c (parse-integer id)))
  (:method ((c combat) (id integer))
    (find id (players c) :key #'id)))

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

(defun add-player (name &optional (hostile-p T)
		   (initiative 0) (combat *current-combat*) (bloodied-p nil))
  (let ((p (make-instance 'player :name name
		       :initiative initiative
		       :hostile-p hostile-p
		       :bloodied-p bloodied-p
		       :id (incf (max-id combat)))))
    (push p (players combat))
    p))

(defun d20 ()
  (1+ (random 20)))

(defun add-hostiles (name int-mod &key (n 1) (start (hostile-count *current-combat*)))
 
  (dotimes (i n)
    (add-player (format nil "~a ~a" name (+ start i))
		T (+ int-mod (d20))))
  (setf (hostile-count *current-combat*)
	(+ n start))
  )

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
  (iter (for id in ids)
	(for p = (player-by-id *current-combat* id))
	(setf (bloodied-p p)
	      (if (eq :toggle bloodyp)
		  (not (bloodied-p p))
		  bloodyp))))

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
				    l))))))

(defun !move-up (id)
  (setf (players *current-combat*) (move-up id)))