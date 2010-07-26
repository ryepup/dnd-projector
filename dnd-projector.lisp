;;; -*- mode: lisp; indent-tabs: nil -*-

(in-package :dnd-projector)


(defun start-server ()
  (hunchentoot:start (make-instance 'hunchentoot:acceptor :port 8081))
  (entry-points)
  (sb-thread:make-thread #'read-ir-commands
			 :name "IR reader")
  )
