;;; -*- mode: lisp; indent-tabs: nil -*-

(defsystem :dnd-projector
  :serial t
  ;; add new files to this list:
  :components ((:file "package") (:file "dnd-projector"))
  :depends-on (#+nil :cl-ppcre))
