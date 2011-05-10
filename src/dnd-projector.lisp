;;; -*- mode: lisp; indent-tabs: nil -*-

(in-package :dnd-projector)

(defparameter +projector-event-channel+ "pec")

(define-condition event-added () ())

(defun projector-event (thing)
  "sends the thing to the project event queue"
  (signal 'event-added)
  (redis:with-connection ()
    (redis:red-publish +projector-event-channel+
		       (json:encode-json-to-string thing))))

(defvar *current-combat* nil)

(defun ensure-combat (&optional reset (init-bonus 2))
  (when (or reset (null *current-combat*))
    (setf *current-combat* (make-combat))
    (iter (for n in '("Ryepup" "Jack" "Ecthellion" "Tibbar" "Ammonia"))
	  (for mod in '(12 9 11 9 16))
	  (add-player n nil (+ mod (d20) init-bonus) *current-combat* nil))
    (sort-players)))
