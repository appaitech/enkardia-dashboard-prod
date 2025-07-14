import { useState } from "react";
import { Eye, Link, ExternalLink } from "lucide-react";
import { format } from "date-fns";

import { CallToAction } from "@/types/callToAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DashboardCallToActionProps {
  callToActions: CallToAction[];
  onViewCallToAction: (callToAction: CallToAction) => void;
}

export default function DashboardCallToAction({ callToActions, onViewCallToAction }: DashboardCallToActionProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Calculate stats
  const unviewedCTAs = callToActions.filter(cta => !cta.viewed);
  const viewedCTAs = callToActions.filter(cta => cta.viewed);
  const stats = {
    total: callToActions.length,
    unviewed: unviewedCTAs.length,
    viewed: viewedCTAs.length,
  };

  if (stats.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Call to Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No call to actions available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5" />
          New Call to Actions
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {stats.total}</span>
          <span>Unviewed: {stats.unviewed}</span>
          <span>Viewed: {stats.viewed}</span>
        </div>
      </CardHeader>
      {stats.unviewed > 0 && (
        <CardContent>
          <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems}>
            {unviewedCTAs.map((cta) => (
              <AccordionItem key={cta.id} value={cta.id} className="border-b last:border-b-0">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex flex-1 justify-between items-center">
                    <span className="text-sm font-medium">{cta.title}</span>
                    <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                      New
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3">
                    {cta.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{cta.description}</p>
                    )}
                    {cta.urls.length > 0 && (
                      <div className="space-y-1">
                        {cta.urls.map((url) => (
                          <a
                            key={url.id}
                            href={url.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Link className="h-4 w-4 mr-1" />
                            {url.label || url.url}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(cta.createdAt), "PPP")}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          onViewCallToAction(cta);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Mark as Viewed
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
}