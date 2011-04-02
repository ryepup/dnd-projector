;;; -*- mode: lisp; indent-tabs: nil -*-

(defsystem :dnd-projector
  :serial t
  :components
  ((:module :src
	    :serial t
	    :components ((:file "package")
			 (:file "dnd-projector")
			 (:file "dnd")
			 (:file "www"))))
  :depends-on (#:cl-ppcre #:chanl #:alexandria #:iterate
			  #:hunchentoot #:cl-json))
