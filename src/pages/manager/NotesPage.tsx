import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Note } from "@shared/types";
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
const noteSchema = z.object({
  text: z.string().min(1, 'Note cannot be empty.'),
});
export function NotesPage() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { text: '' },
  });
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const data = await api<{ notes: Note[] }>('/api/notes');
      setNotes(data.notes.sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || a.id.localeCompare(b.id)));
    } catch (error) {
      toast.error("Failed to fetch notes.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchNotes();
  }, []);
  const onSubmit = async (values: z.infer<typeof noteSchema>) => {
    try {
      await api('/api/notes', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      form.reset();
      fetchNotes();
    } catch (error) {
      toast.error("Failed to add note.");
    }
  };
  const toggleNote = async (note: Note) => {
    try {
      await api(`/api/notes/${note.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !note.completed }),
      });
      fetchNotes();
    } catch (error) {
      toast.error("Failed to update note.");
    }
  };
  const deleteNote = async (id: string) => {
    try {
      await api(`/api/notes/${id}`, { method: 'DELETE' });
      toast.success("Note deleted.");
      fetchNotes();
    } catch (error) {
      toast.error("Failed to delete note.");
    }
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">{t('notes_title')}</h1>
          <p className="text-muted-foreground">{t('notes_description')}</p>
        </div>
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>{t('notes_cardTitle')}</CardTitle>
            <CardDescription>{t('notes_cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 mb-6">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={t('notes_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={form.formState.isSubmitting}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </form>
            </Form>
            <div className="space-y-3">
              {isLoading ? <p>Loading notes...</p> : notes.length > 0 ? (
                <AnimatePresence>
                  {notes.map(note => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          id={`note-${note.id}`}
                          checked={note.completed}
                          onCheckedChange={() => toggleNote(note)}
                          className="h-5 w-5"
                        />
                        <label
                          htmlFor={`note-${note.id}`}
                          className={cn("text-sm font-medium leading-none cursor-pointer transition-colors", note.completed && "line-through text-muted-foreground")}
                        >
                          {note.text}
                        </label>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <p className="font-semibold">{t('notes_empty')}</p>
                  <p className="text-sm">Add a new to-do item above to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}