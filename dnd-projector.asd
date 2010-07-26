;;; -*- mode: lisp; indent-tabs: nil -*-

(defsystem :dnd-projector
  :serial t
  ;; add new files to this list:
  :components ((:file "package") 
	       (:file "ir-reader")
	       (:file "www")
	       (:file "dnd-projector"))
  :depends-on (#:cl-ppcre #:chanl #:alexandria #:iterate #:cl-arduino
			  #:hunchentoot #:yaclml #:cl-json))
