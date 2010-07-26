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


(hunchentoot:define-easy-handler (ir-commands :uri "/ir.json") ()
  (let ((key (chanl:recv *incoming-ir-channel*)))
    (json:encode-json-to-string
     (list (cons :key key)))))
