;;; -*- mode: lisp; indent-tabs: nil -*-

(defsystem :dnd-projector
  :serial t
  ;; add new files to this list:
  :components ((:file "package")
	       (:file "dnd")
	       (:file "www")
	       (:file "dnd-projector"))
  :depends-on (#:cl-ppcre #:chanl #:alexandria #:iterate
			  #:hunchentoot #:cl-json))
